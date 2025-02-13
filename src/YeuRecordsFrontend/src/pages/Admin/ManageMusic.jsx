import { useState, useEffect } from "react";
import icons from "../../utils/icon";
import Swal from "sweetalert2";
import { ListMusicAdmin } from "../../components/index";
import { Table } from "../../components/index";
import {
  apiGetAllMusicByIdCategory,
  apiDeleteMusicById,
  apiGetAllCategory,
} from "../../apis";

const {
  IoSearch,
  FiTrash,
  FaMusic,
  GiCalendarHalfYear,
  MdCalendarMonth,
  IoIosToday,
  CiSquareQuestion,
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
            actionIcons={{ delete: <FiTrash /> }}
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
