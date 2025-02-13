import { useState, useEffect } from "react";
import icons from "../../utils/icon";
import { Table } from "../../components/index";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

const {
  RxValueNone,
  IoSearch,
  TbAlbum,
  MdOutlineCategory,
  IoMdAlbums,
  IoIosCreate,
  IoIosClose,
  FiEdit,
  FiTrash,
} = icons;

import {
  apiGetCategoryStatistics,
  apiGetAllCategory,
  apiDeleteCategoryById,
  apiCreateCategory,
  apiUpdateCategoryById,
  apiGetAllAlbum,
} from "../../apis";

const ManageCategories = () => {
  const [selectedData, setSelectedData] = useState("category");
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState();
  const [dataStatistic, setDataStatistic] = useState({});
  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formik = useFormik({
    initialValues: {
      nameCategory: selectedCategory?.categoryName || "",
      description: selectedCategory?.description || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      nameCategory: Yup.string().required("category name is required"),
      description: Yup.string().required("description is required"),
    }),
    onSubmit: async (values) => {
      try {
        if (selectedCategory) {
          // Cập nhật danh mục
          await apiUpdateCategoryById(selectedCategory.id, {
            categoryName: values.nameCategory,
            description: values.description,
          });
          toast.success("Category updated successfully!");

          // Gọi lại API để làm mới danh sách
          const response = await apiGetAllCategory(currentPage - 1, pageSize);
          setCategories(response.data.content);

          fetchDataStatistic();
        } else {
          // Tạo mới danh mục
          const response = await apiCreateCategory({
            categoryName: values.nameCategory,
            description: values.description,
          });
          toast.success("Category created successfully!");

          setCategories((prevCategories) => [
            ...prevCategories,
            response.data.result,
          ]);

          fetchDataStatistic();
        }

        // Clear form
        formik.resetForm();
        setIsModalOpen(false);
      } catch (error) {
        if (error.response?.status === 409) {
          toast.error(error.response.data.message);
        } else {
          console.log("An unexpected error occurred. Please try again.");
        }
      }
    },
  });

  const handleClearInput = () => {
    setSearchValue("");
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    if (selectedData === "category") {
      setIsModalOpen(true);
      setSelectedCategory(row);
    } else if (selectedData === "album") {
      Swal.fire({
        title: "Cannot edit album",
        text: "This album belongs to an artist. Please ask the artist to manage their own album.",
        icon: "info",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Got it",
      });
    }
  };

  const handleDelete = (row) => {
    if (selectedData === "category") {
      Swal.fire({
        title: "Are you sure?",
        text: "When you delete a category, all the songs in the category will also be lost. This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          // Gọi API xóa danh mục
          apiDeleteCategoryById(row.id)
            .then((response) => {
              // Xử lý nếu xóa thành công
              Swal.fire(
                "Deleted!",
                "The category and all its songs have been deleted.",
                "success"
              );
              // Cập nhật lại danh sách categories nếu cần
              setCategories((prevCategories) =>
                prevCategories.filter((category) => category.id !== row.id)
              );
              fetchDataStatistic();
            })
            .catch((error) => {
              Swal.fire(
                "Error!",
                "There was a problem deleting the category. Please try again.",
                "error"
              );
            });
        } else {
          console.log("Deletion cancelled");
        }
      });
    } else if (selectedData === "album") {
      // Khi chọn album, thông báo rằng album thuộc về nghệ sĩ và không thể xóa ở đây
      Swal.fire({
        title: "Cannot delete album",
        text: "This album belongs to an artist. Please ask the artist to manage their own album.",
        icon: "info",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Got it",
      });
    }
  };

  // filler search
  const filteredCategories = categories.filter((item) => {
    const searchTerm = searchValue.toLowerCase();
    if (selectedData === "category") {
      // Lọc danh mục category
      return (
        item.categoryName?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      );
    } else if (selectedData === "album") {
      return (
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.artistName && item.artistName.toLowerCase().includes(searchTerm))
      );
    }

    return false;
  });

  const columns =
    selectedData === "album"
      ? [
          { label: "Album Name", accessor: "name" },
          { label: "Artist", accessor: "nameArtist" },
          { label: "Total Music", accessor: "totalMusic" },
          { label: "Created At", accessor: "createdAt" },
          { label: "Update At", accessor: "updatedAt" },
        ]
      : [
          { label: "Name Category", accessor: "categoryName" },
          { label: "Description", accessor: "description" },
          { label: "Total Music", accessor: "totalMusic" },
          { label: "Created At", accessor: "createdAt" },
          { label: "Update At", accessor: "updatedAt" },
        ];

  const fetchDataStatistic = async () => {
    try {
      const response = await apiGetCategoryStatistics();
      setDataStatistic(response.data.result);
    } catch (error) {
      console.log(error);
    }
  };

  // api thống kê
  useEffect(() => {
    fetchDataStatistic();
  }, []);

  // Khi thay đổi kích thước trang (pageSize)
  const handlePageSizeChange = (e) => {
    const newPageSize = e.target.value;
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Khi người dùng thay đổi trang (currentPage)
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDataChange = (event) => {
    const value = event.target.value;
    setSelectedData(value);
    setCurrentPage(1);
  };

  // api get all data album or category
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedData === "category") {
          const response = await apiGetAllCategory(currentPage - 1, pageSize);
          setCategories(response.data.content);
          setTotalItems(response.data.totalElements);
        } else if (selectedData === "album") {
          const response = await apiGetAllAlbum(currentPage - 1, pageSize);
          console.log(response.data);
          setCategories(
            response.data.content.map((album) => ({
              ...album,
              totalMusic: album.musics?.length || 0,
              categoryName: album.albumName,
              description: album.artistName || "Unknown Artist",
            }))
          );
          setTotalItems(response.data.totalElements);
        }
      } catch (error) {
        console.log("Error while fetching data.");
      }
    };

    fetchData();
  }, [selectedData, currentPage, pageSize]);

  return (
    <>
      <div className="p-4 flex flex-col gap-3 ">
        <div className="w-full flex flex-col gap-4 bg-[#fff] rounded-[6px] text-[#fff] shadow p-4 select-none">
          <div className="text-[#000] font-medium text-[17px]">
            Statistical Category
          </div>
          <div className="md:flex md:gap-4 items-center gap-8 flex-wrap">
            <div className="flex flex-col items-center gap-2 p-4 bg-[#4C8BF5] rounded-[6px] shadow md:w-[216px]">
              <div className="flex items-center gap-2">
                <MdOutlineCategory />
                <div>Total Category</div>
              </div>
              <div>{dataStatistic.totalCategory}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#8BC34A] rounded-[6px] shadow md:my-0 my-2 md:w-[216px]">
              <div className="flex items-center gap-2">
                <IoMdAlbums />
                <div>Total Album</div>
              </div>
              <div>{dataStatistic.totalAlbum}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#FF7043] rounded-[6px] shadow md:my-0 my-2 md:w-[216px]">
              <div className="flex items-center gap-2">
                <RxValueNone />
                <div>Unalbumed Music</div>
              </div>
              <div>{dataStatistic.unalbumedMusic}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#26C6DA] rounded-[6px] shadow md:my-0 my-2 md:w-[216px]">
              <div className="flex items-center gap-2">
                <TbAlbum />
                <div>New album today</div>
              </div>
              <div>{dataStatistic.newAlbumToday}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#EF5350] rounded-[6px] shadow md:w-[216px]">
              <div className="flex items-center gap-2">
                <TbAlbum />
                <div>New category today</div>
              </div>
              <div>{dataStatistic.newCategoryToday}</div>
            </div>
          </div>
        </div>
        <div className="w-full shadow p-4 rounded-[6px] bg-[#fff] flex flex-col gap-3 select-none">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex items-center gap-2 p-3 bg-[#000] text-[#fff] rounded-[6px] cursor-pointer sm:w-auto w-full"
              onClick={handleCreate}
            >
              <IoIosCreate />
              <div>Create</div>
            </div>

            <select
              value={selectedData}
              onChange={handleDataChange}
              className="bg-[#f3f1f1] py-[11px] px-4 rounded-md outline-none md:w-[209px] w-full"
            >
              <option value="category">List Category</option>
              <option value="album">List Album</option>
            </select>
          </div>
        </div>
        <div className="w-full flex flex-col gap-4 shadow p-4 rounded-[6px] bg-[#fff]">
          <div className="flex items-center justify-between">
            <div className="text-[#000] font-medium text-[17px] mb-0 hidden sm:block">
              Data Category Or Album
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center relative transition-all duration-500 ease-in-out w-[212px] sm:w-[240px]">
                <div className="flex items-center justify-center absolute left-0 top-0 h-full p-2 rounded-[50%]">
                  <IoSearch size="18px" />
                </div>
                <input
                  type="text"
                  placeholder="Search data ..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-8 p-2 rounded-md border border-[#ccc] focus:outline-none transition-all duration-500 ease-in-out w-full opacity-100"
                  style={{
                    fontWeight: "300",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div
                onClick={handleClearInput}
                className="flex items-center gap-2 select-none p-[10px] text-[14px] bg-[#f1f1f1] text-[#000] rounded-[6px] cursor-pointer"
              >
                <div>Clear</div>
              </div>
            </div>
          </div>

          <Table
            data={filteredCategories}
            columns={columns}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            actionIcons={{ edit: <FiEdit />, delete: <FiTrash /> }}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-[6px] shadow-lg p-6 w-[400px] relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
                onClick={() => setIsModalOpen(false)}
              >
                <IoIosClose size="26px" />
              </button>
              <h2 className="text-left text-lg font-semibold mb-4">
                {selectedCategory
                  ? "Update your category"
                  : "Create your category"}
              </h2>
              <form onSubmit={formik.handleSubmit}>
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="nameCategory"
                    value={formik.values.nameCategory}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-[6px] ${
                      formik.touched.nameCategory && formik.errors.nameCategory
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter category name"
                  />
                  {formik.touched.nameCategory &&
                    formik.errors.nameCategory && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.nameCategory}
                      </p>
                    )}
                </div>

                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1">
                    Description Name
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-[6px] ${
                      formik.touched.description && formik.errors.description
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter description"
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.description}
                    </p>
                  )}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded-[8px] hover:bg-gray-600"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#000] text-white rounded-[6px]"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageCategories;
