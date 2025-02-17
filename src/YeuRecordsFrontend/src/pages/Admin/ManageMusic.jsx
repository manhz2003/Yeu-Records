import { useState, useEffect } from "react";
import icons from "../../utils/icon";
import Swal from "sweetalert2";
import { ListMusicAdmin } from "../../components/index";
import { Table } from "../../components/index";
import {
  apiGetAllMusicByIdCategory,
  apiDeleteMusicById,
  apiGetAllCategory,
  apiGetAllStatusMusic,
  apiUpdateStatusMusic,
} from "../../apis";
import { toast } from "react-toastify";
import { data } from "autoprefixer";

const {
  IoSearch,
  FiTrash,
  FaMusic,
  GiCalendarHalfYear,
  MdCalendarMonth,
  IoIosToday,
  CiSquareQuestion,
  BsCloudDownload,
  TbStatusChange,
} = icons;

const ManageMusic = () => {
  const [searchValue, setSearchValue] = useState("");
  const [dataCategory, setDataCategory] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [dataMusic, setDataMusic] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [listMusic, setListMusic] = useState([]);
  const [statusMusic, setStatusMusic] = useState();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const fetchDataCategory = async () => {
    try {
      const response = await apiGetAllCategory(0, -1);
      if (response.status === 200) {
        setDataCategory(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDataCategory();
  }, []);

  const handleDownload = (row) => {
    const fileUrl = row?.musicUrl; // Lấy URL từ dữ liệu hàng

    if (fileUrl) {
      // Tạo một liên kết tạm thời
      const link = document.createElement("a");
      link.href = fileUrl; // Đặt đường dẫn tải xuống
      link.download = row?.musicName || "yeurecord"; // Đặt tên file nếu có

      // Kiểm tra để đảm bảo rằng file URL có thể tải xuống trực tiếp
      // Nếu fileUrl chứa "cloudinary", dùng cách thay thế cho các URL nếu cần
      if (fileUrl.includes("cloudinary")) {
        // Tạo một HTTP request để kiểm tra file trước khi tải xuống
        const xhr = new XMLHttpRequest();
        xhr.open("GET", fileUrl, true);
        xhr.responseType = "blob"; // Lấy file dưới dạng blob

        xhr.onload = () => {
          const blob = xhr.response;
          const url = window.URL.createObjectURL(blob);
          link.href = url;
          link.download = row?.musicName || "yeurecord"; // Đặt tên file

          // Kích hoạt tải xuống
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Giải phóng đối tượng URL
          window.URL.revokeObjectURL(url);
        };

        xhr.onerror = () => {
          console.log("Error loading the file.");
        };

        xhr.send(); // Gửi request để lấy file
      } else {
        // Nếu không cần xử lý thêm (chỉ cần tải file từ URL), kích hoạt tải xuống ngay
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      console.log("Không có URL để tải xuống");
    }
  };

  const fetchDataMusic = async () => {
    try {
      let response;
      if (categoryId === undefined) {
        response = await apiGetAllMusicByIdCategory(currentPage - 1, pageSize);
      } else {
        response = await apiGetAllMusicByIdCategory(
          categoryId,
          currentPage - 1,
          pageSize
        );
      }

      if (response.status === 200) {
        setTotalItems(response.data.result.totalMusic);
        setDataMusic(response.data.result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDataMusic();
  }, [categoryId]);

  useEffect(() => {
    const updatedListMusic = dataMusic?.musics.map((music) => ({
      musicName: music.musicName,
      musicUrl: music.musicUrl,
      thumbnailUrl: music.thumbnailUrl,
      artist: music.fullName,
      statusMusic: music.statusMusic,
    }));

    setListMusic(updatedListMusic);
  }, [dataMusic]);

  const handleClearInput = () => {
    setSearchValue("");
  };

  const handleIdChange = (event) => {
    setCategoryId(event.target.value);
  };

  const handleDelete = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Deleting this artist will remove all their associated data permanently. Please consider carefully!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Delete artist", row);

        // Hiển thị loading khi xóa
        Swal.fire({
          title: "Deleting...",
          text: "Please wait while we delete the music.",
          icon: "info",
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Gọi API để xóa bài hát theo ID
        apiDeleteMusicById(row.id)
          .then((response) => {
            Swal.fire(
              "Deleted!",
              "The artist has been deleted successfully.",
              "success"
            );
            // Cập nhật danh sách hoặc làm gì đó sau khi xóa thành công
            fetchDataMusic();
          })
          .catch((error) => {
            Swal.fire(
              "Error!",
              "There was an error deleting the artist. Please try again.",
              "error"
            );
            console.error("Error deleting music:", error);
          });
      } else {
        console.log("Deletion cancelled");
      }
    });
  };

  const columns = [
    { label: "Music Name", accessor: "musicName" },
    { label: "Artist", accessor: "fullName" },
    { label: "Album Name", accessor: "albumName" },
    { label: "Category Name", accessor: "categoryName" },
    { label: "Album Name", accessor: "album_name" },
    { label: "collab", accessor: "description" },
    { label: "Status Music", accessor: "statusMusic" },
    { label: "Created At", accessor: "createdAt" },
    { label: "Updated At", accessor: "updatedAt" },
  ];

  const handlePageSizeChange = (e) => {
    const newPageSize = e.target.value;
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredMusic = dataMusic?.musics.filter((music) =>
    music.musicName.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleCheckboxChange = (id, isChecked) => {
    if (id === "all") {
      if (isChecked) {
        setSelectedRows(data.map((row) => row.id));
      } else {
        setSelectedRows([]);
      }
    } else {
      setSelectedRows((prev) =>
        isChecked ? [...prev, id] : prev.filter((rowId) => rowId !== id)
      );
    }
  };

  const fetchDataStatusMusic = async () => {
    try {
      const response = await apiGetAllStatusMusic();
      if (response.status === 200) {
        setStatusMusic(response.data.result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDataStatusMusic();
  }, []);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handleChangeStatusMusic = async () => {
    if (selectedRows.length === 0 || selectedStatus.length === 0) {
      toast.error("Please select the track and change status.");
      return;
    }

    try {
      const data = {
        musicIds: selectedRows,
        statusMusicId: selectedStatus,
      };

      const response = await apiUpdateStatusMusic(data);
      if (response.status === 200) {
        toast.success("Update track status successfully");
        fetchDataMusic();
      }
    } catch (error) {
      toast.error(error);
      console.log(error);
    }
  };

  return (
    <>
      <div className="p-4 flex flex-col gap-3 w-full">
        <div className="w-full flex flex-col gap-4 bg-[#fff] rounded-[6px] text-[#fff] shadow p-4 select-none">
          <div className="text-[#000] font-medium text-[17px]">
            Statistical Music
          </div>
          <div className="md:flex md:gap-4 items-center gap-8 flex-wrap">
            <div className="flex flex-col items-center gap-2 p-4 bg-[#6699CC] rounded-[6px] shadow md:w-[216px]">
              <div className="flex items-center gap-2">
                <FaMusic />
                <div>Total Music</div>
              </div>
              <div>{dataMusic?.totalMusic}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#8BC34A] rounded-[6px] shadow md:my-0 my-2 md:w-[216px]">
              <div className="flex items-center gap-2">
                <IoIosToday />
                <div>Released Today</div>
              </div>
              <div>{dataMusic?.totalMusicToday}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#4DB6AC] rounded-[6px] shadow md:my-0 my-2 md:w-[216px]">
              <div className="flex items-center gap-2">
                <MdCalendarMonth />
                <div>Released Week</div>
              </div>
              <div>{dataMusic?.totalMusicThisWeek}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#607D8B] rounded-[6px] shadow md:w-[216px]">
              <div className="flex items-center gap-2">
                <GiCalendarHalfYear />
                <div>Released Month</div>
              </div>
              <div>{dataMusic?.totalMusicThisMonth}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#E57373] rounded-[6px] shadow md:my-0 my-2 md:w-[216px]">
              <div className="flex items-center gap-2">
                <CiSquareQuestion />
                <div>Released Year</div>
              </div>
              <div>{dataMusic?.totalMusicThisYear}</div>
            </div>
          </div>
        </div>

        <div className="w-full shadow p-4 rounded-[6px] bg-[#fff] flex items-center gap-5 select-none">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryId}
              onChange={handleIdChange}
              className="bg-[#f3f1f1] py-[11px] px-4 rounded-md outline-none md:w-[210px] w-full"
            >
              <option value="" disabled>
                Select your category
              </option>
              {dataCategory.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </select>

            <div
              className="flex items-center gap-2 p-3 bg-[#000] text-[#fff] rounded-[6px] cursor-pointer sm:w-auto w-full"
              onClick={handleChangeStatusMusic}
            >
              <TbStatusChange />
              <div>Change Status Music</div>
            </div>

            <div className="flex gap-4">
              {statusMusic?.map((status) => (
                <label
                  key={status?.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="statusMusic"
                    value={status?.id} // Lưu trữ ID thay vì name
                    checked={selectedStatus === status.id} // Kiểm tra ID thay vì name
                    onChange={() => handleStatusChange(status.id)} // Gửi ID khi thay đổi
                    className="hidden"
                  />
                  <span
                    className={`w-5 h-5 flex justify-center items-center border-2 rounded-full ${
                      selectedStatus === status.id
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedStatus === status.id && "●"}
                  </span>
                  <span>{status.nameStatus}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-4 shadow p-4 rounded-[6px] bg-[#fff]">
          <div className="flex items-center justify-between">
            <div className="text-[#000] font-medium text-[17px] mb-0 hidden sm:block">
              Data Artist
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
            data={filteredMusic}
            columns={columns}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageSizeChange={handlePageSizeChange}
            onDelete={handleDelete}
            onDownload={handleDownload}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            onCheckboxChange={handleCheckboxChange}
            enableCheckbox={true}
            actionIcons={{ delete: <FiTrash />, download: <BsCloudDownload /> }}
          />
        </div>

        <div className="flex flex-col gap-4 md:h-[380px] h-[360px] p-4 bg-[#fff] rounded-[6px]">
          <div className="">
            <ListMusicAdmin listMusic={listMusic} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageMusic;
