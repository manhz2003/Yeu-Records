import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import icons from "../../utils/icon";
import { Table } from "../../components/index";
const { BsCloudDownload, IoSearch, FiTrash } = icons;
import { apiGetAllLicense, apiDeleteLicenseById } from "../../apis";

const ManageLicenses = () => {
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLicense, setDataLicense] = useState();
  const [searchValue, setSearchValue] = useState("");

  const fetchDataLicense = async () => {
    try {
      const response = await apiGetAllLicense(currentPage - 1, pageSize);
      if (response.status === 200) {
        setTotalItems(response.data.result.totalElements);
        setDataLicense(response.data.result.content);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredMusic = dataLicense?.filter((item) =>
    item.musicName.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    fetchDataLicense();
  }, [currentPage, pageSize]);

  const columns = [
    { label: "Artist Name", accessor: "fullName" },
    { label: "Music Name", accessor: "musicName" },
    { label: "Link PDF", accessor: "pdfUrl" },
    { label: "Created At", accessor: "createdAt" },
    { label: "Updated At", accessor: "updatedAt" },
  ];

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You should only remove this license after agreement with the artist to avoid unwanted situations.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleting...",
        text: "Please wait while we process your request.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        console.log(row.id);

        const response = await apiDeleteLicenseById(row.id);
        if (response.status === 204) {
          Swal.fire(
            "Deleted!",
            "The license has been deleted successfully.",
            "success"
          );
          fetchDataLicense();
        } else {
          throw new Error("Failed to delete the license.");
        }
      } catch (error) {
        Swal.fire(
          "Error",
          "Failed to delete the license. Please try again.",
          "error"
        );
        console.error("Error deleting license:", error);
      }
    }
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = e.target.value;
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleClearInput = () => {
    setSearchValue("");
  };

  const handleDowloadPdf = async (row) => {
    try {
      const response = await fetch(row?.pdfUrl);
      if (!response.ok) {
        throw new Error("Failed to download file.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `license-${row?.musicName || "document"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
      Swal.fire(
        "Download Error",
        "Failed to download the PDF. Please try again.",
        "error"
      );
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="w-full shadow p-4 rounded-[6px] bg-white flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="text-[#000] font-medium text-[17px] mb-0 hidden sm:block">
            Data License
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
          onEdit={handleDowloadPdf}
          onDelete={handleDelete}
          actionIcons={{ edit: <BsCloudDownload />, delete: <FiTrash /> }}
        />
      </div>
    </div>
  );
};

export default ManageLicenses;
