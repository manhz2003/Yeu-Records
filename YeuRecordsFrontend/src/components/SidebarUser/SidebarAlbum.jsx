import React, { useState, useEffect, useRef } from "react";
import icons from "../../utils/icon";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
const {
  IoMdAlbums,
  FaPlus,
  IoSearch,
  FaMusic,
  CiCircleList,
  MdDelete,
  RxUpdate,
  IoIosClose,
} = icons;

import {
  apiCreateAlbum,
  apiDeleteAlbumById,
  apiUpdateAlbumById,
  apiGetAllAlbumByIdUser,
} from "../../apis/album";

import { uploadFileToCloudinary } from "../../apis/cloudinary";

const SidebarAlbum = React.memo(
  ({ onDataAlbumIdChange, onDataAlbumChange }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const inputRef = useRef(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dataAlbum, setDataAlbum] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Formik configuration
    const formik = useFormik({
      initialValues: {
        name: selectedAlbum?.name || "",
        imageFile: selectedAlbum?.thumbnailUrl || "",
      },
      enableReinitialize: true,
      validationSchema: Yup.object({
        name: Yup.string().required("Album name is required"),
        imageFile: Yup.mixed().required("Image is required"),
      }),

      onSubmit: async (values) => {
        try {
          setIsLoading(true);
          const userInfo = JSON.parse(localStorage.getItem("userInfo"));
          let imageUrl;

          if (values.imageFile) {
            imageUrl = await uploadFileToCloudinary(
              values.imageFile,
              "imgAlbumMusic"
            );
          } else {
            imageUrl = previewImage;
          }

          const albumData = {
            name: values.name.trim(),
            thumbnailUrl: imageUrl.secure_url || previewImage,
          };

          // Kiểm tra tên album có trùng không
          const isNameExist = dataAlbum.some(
            (album) => album.name.trim() === albumData.name
          );
          if (isNameExist) {
            toast.error(
              "Your album already exists, please choose another name."
            );
            return;
          }

          if (selectedAlbum) {
            await apiUpdateAlbumById(
              userInfo.userId,
              selectedAlbum.id,
              albumData
            );
            toast.success("Album cập nhật thành công");
          } else {
            await apiCreateAlbum(userInfo.userId, albumData);
            toast.success("Tạo album thành công");
          }

          fetchDataAlbum();
          setIsModalOpen(false);
          formik.resetForm();
        } catch (error) {
          console.error("Lỗi khi lưu album: ", error);
          toast.error("Đã có lỗi xảy ra khi lưu album.");
        } finally {
          setIsLoading(false);
        }
      },
    });

    const fetchDataAlbum = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const response = await apiGetAllAlbumByIdUser(userInfo.userId);
        if (response.status === 200) {
          setDataAlbum(response.data);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("User not found.");
        } else {
          console.error("An error occurred:", error);
        }
      }
    };

    useEffect(() => {
      fetchDataAlbum();
    }, []);

    useEffect(() => {
      if (dataAlbum) {
        onDataAlbumChange(dataAlbum);
      }
    }, [dataAlbum, onDataAlbumChange]);

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      formik.setFieldValue("imageFile", file);
      setPreviewImage(URL.createObjectURL(file));
    };

    const handleEdit = (album) => {
      setSelectedAlbum({
        id: album.id,
        name: album.name,
        thumbnailUrl: album.thumbnailUrl || "",
      });
      setPreviewImage(album.thumbnailUrl || "");
      setIsModalOpen(true);
    };

    const sendDataAlbumIdToParent = (id) => {
      onDataAlbumIdChange(id);
    };

    const handleDelete = (album) => {
      Swal.fire({
        title: "Are you sure?",
        text: "Your album will be deleted, but your songs will still remain in the system.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            await apiDeleteAlbumById(userInfo.userId, album.id);
            fetchDataAlbum();
            return true;
          } catch (error) {
            console.error("Error while deleting album: ", error);
            throw new Error("An error occurred while deleting the album.");
          }
        },
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          toast.success("Album deleted successfully!");
        } else {
          toast.error("An error occurred while deleting the album.");
        }
      });
    };

    useEffect(() => {
      if (isSearchOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isSearchOpen]);

    // Hàm tìm kiếm
    const filteredAlbums = dataAlbum.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (e) => {
      setSearchQuery(e.target.value);
    };

    return (
      <div className="h-full w-full md:w-[31%] bg-[#fefefe] rounded-[8px] shadow-sm p-5 flex flex-col gap-5">
        <div className="flex items-center w-full">
          <div className="flex items-center gap-2 text-[18px]">
            <IoMdAlbums />
            <div className="font-medium select-none">Your Albums</div>
          </div>

          {/* create hoặc cập nhật album */}
          <div className="ml-auto">
            <div
              className="cursor-pointer hover:bg-[#000] hover:text-[#fff] p-2 rounded-[50%] transition-all duration-300"
              onClick={() => {
                setSelectedAlbum(null);
                setPreviewImage("");
                setIsModalOpen(true);
              }}
            >
              <FaPlus />
            </div>

            {/* Modal */}
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
                    {selectedAlbum && selectedAlbum.name
                      ? "Update your album"
                      : "Create your album"}
                  </h2>

                  <form onSubmit={formik.handleSubmit}>
                    <div className="mb-4">
                      <label className="block font-medium text-gray-700 mb-1">
                        Album Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-3 py-2 border rounded-[6px] ${
                          formik.touched.name && formik.errors.name
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter album name"
                      />
                      {formik.touched.name && formik.errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.name}
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block font-medium text-gray-700 mb-1">
                        Upload Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className={`w-full px-3 py-2 border rounded-[6px] ${
                          formik.touched.imageFile && formik.errors.imageFile
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formik.touched.imageFile && formik.errors.imageFile && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.imageFile}
                        </p>
                      )}
                      {previewImage && (
                        <div className="mt-4">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-[6px]"
                          />
                        </div>
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
                        onClick={formik.handleSubmit}
                        className="px-4 py-2 bg-[#000] text-white rounded-[6px] flex items-center justify-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="saving-text">
                              Saving <span className="dot">.</span>
                              <span className="dot">.</span>
                              <span className="dot">.</span>
                            </span>
                          </>
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 justify-end relative">
          {!isSearchOpen && (
            <div className="flex gap-3 mr-auto cursor-default select-none">
              <div className="bg-[#292929] text-[#fff] rounded-[15px] px-3 py-2 text-[15px]">
                Albums
              </div>
              <div className="bg-[#292929] text-[#fff] rounded-[15px] px-3 py-2 text-[15px]">
                Artist
              </div>
            </div>
          )}

          <div
            className={`flex items-center relative transition-all duration-500 ease-in-out ${
              isSearchOpen
                ? "w-[212px] md:translate-x-[-58px] translate-x-[-75px]"
                : "w-[40px]"
            } sm:w-[240px]`}
          >
            <div
              className={`flex items-center justify-center absolute left-0 top-0 h-full p-2 rounded-[50%] cursor-pointer transition-all duration-300 ${
                isSearchOpen ? "translate-x-0" : "translate-x-[-5px]"
              } ${isSearchOpen ? "" : "hover:bg-[#000] hover:text-[#fff]"}`}
              onClick={() => setIsSearchOpen(true)}
            >
              <IoSearch size="18px" />
            </div>
            <input
              type="text"
              placeholder="Search in Your Album"
              className={`pl-8 p-2 rounded-md border border-[#ccc] focus:outline-none outline-none transition-all duration-500 ease-in-out ${
                isSearchOpen ? "w-full opacity-100" : "w-0 opacity-0"
              }`}
              style={{
                fontWeight: "300",
                fontSize: "14px",
                pointerEvents: isSearchOpen ? "auto" : "none",
              }}
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setIsSearchOpen(false)}
              ref={inputRef}
            />
          </div>

          <div className="flex justify-end gap-2 items-center cursor-default p-2 select-none">
            <div>List</div>
            <div>
              <CiCircleList />
            </div>
          </div>
        </div>

        <div className="flex items-center border-b border-solid border-gray-300 pb-2 text-[14px] font-medium">
          <div>Title</div>
          <div className="ml-auto">numerical</div>
        </div>

        {/* show data album */}
        <div
          className="flex flex-col gap-2 overflow-y-auto "
          style={{
            maxHeight: "230px",
            boxShadow:
              filteredAlbums.length >= 4
                ? "inset 0 -15px 10px -10px rgba(0, 0, 0, 0)"
                : "none",
            paddingRight: "8px",
          }}
        >
          {filteredAlbums.map((item, index) => (
            <div
              key={index}
              className={` select-none group flex items-center text-[15px] hover:bg-[#e6e6e6] hover:text-[#000] w-[98%] gap-6 cursor-pointer rounded-[8px] p-2 transition-all duration-100 ease-in-out relative
    ${activeIndex === index ? "bg-[#e6e6e6] text-[#000]" : ""}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                if (activeIndex === index) {
                  setActiveIndex(null);
                  sendDataAlbumIdToParent("");
                } else {
                  setActiveIndex(index);
                  sendDataAlbumIdToParent(item.id);
                }
              }}
              title={`Album: ${item.name}`}
            >
              <div
                className={`relative rounded-[6px] transition-all duration-300 ease-in-out ${
                  hoveredIndex === index || activeIndex === index
                    ? "bg-[#fff]"
                    : "bg-[#fd4155]"
                } ${!item.thumbnailUrl ? "p-3" : ""}`}
              >
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="w-[42px] h-[42px] object-cover rounded-[6px]"
                  />
                ) : (
                  <>
                    <FaMusic
                      size="18px"
                      color="#fff"
                      className={`transition-all duration-300 ease-in-out ${
                        hoveredIndex === index || activeIndex === index
                          ? "opacity-0"
                          : "opacity-100"
                      }`}
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out ${
                        hoveredIndex === index || activeIndex === index
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <FaMusic size="18px" color="#000" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div
                  className="font-medium truncate max-w-[200px]"
                  title={item.name || "No name available"}
                >
                  {item.name
                    ? item.name.length > 25
                      ? `${item.name.substring(0, 25)}...`
                      : item.name
                    : "No name available"}
                </div>
              </div>

              {/* Hiển thị icon xóa và sửa khi hover */}
              {hoveredIndex === index ? (
                <div className="ml-auto flex gap-4 opacity-100 transition-all duration-300 ease-in-out">
                  <RxUpdate
                    size="18px"
                    className="cursor-pointer"
                    onClick={() => handleEdit(item)}
                  />
                  <MdDelete
                    size="18px"
                    className="cursor-pointer"
                    onClick={() => handleDelete(item)}
                  />
                </div>
              ) : (
                <div className="ml-auto opacity-100 transition-all duration-300 ease-in-out mr-2">
                  No.{index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default SidebarAlbum;
