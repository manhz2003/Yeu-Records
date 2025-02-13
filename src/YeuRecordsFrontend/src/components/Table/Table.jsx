import React, { useState } from "react";

const Table = ({
  data,
  columns,
  currentPage,
  totalItems,
  onPageChange,
  pageSize,
  enableCheckbox = false,
  selectedRows,
  setSelectedRows,
  actionIcons,
  onEdit,
  onDelete,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 10;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

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

  // Hàm chuyển trang khi nhấp vào các giá trị cột đặc biệt
  const handleRedirect = (value, type) => {
    switch (type) {
      case "Instagram":
        window.open(`${value}`, "_blank", "noopener noreferrer");
        break;
      case "Telegram":
        // Đối với Telegram, mở link với số điện thoại hoặc username
        window.open(`https://t.me/${value}`, "_blank", "noopener noreferrer");
        break;
      case "Facebook":
        window.open(`${value}`, "_blank", "noopener noreferrer");
        break;
      case "Spotify":
        window.open(`${value}`, "_blank", "noopener noreferrer");
        break;
      case "Apple":
        window.open(`${value}`, "_blank", "noopener noreferrer");
        break;
      case "Tiktok":
        window.open(`${value}`, "_blank", "noopener noreferrer");
        break;
      default:
        break;
    }
  };

  // Hàm chuyển đổi tên cột từ camelCase thành tên dễ đọc
  const formatColumnName = (name) => {
    const nameMapping = {
      contactInstagram: "Instagram",
      contactTelegram: "Telegram",
      contactFacebook: "Facebook",
      digitalSpotify: "Spotify",
      digitalAppleMusic: "Apple",
      digitalTiktok: "Tiktok",
    };
    return nameMapping[name] || name;
  };

  return (
    <div className="overflow-x-auto pb-4">
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {enableCheckbox && (
              <th className="p-2 border border-gray-300 text-center">
                <input
                  type="checkbox"
                  checked={
                    selectedRows?.length === data?.length && data?.length > 0
                  }
                  onChange={(e) =>
                    handleCheckboxChange("all", e.target.checked)
                  }
                />
              </th>
            )}
            <th className="p-2 border border-gray-300 font-medium">No</th>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="p-2 border border-gray-300 font-medium"
              >
                {col.label}
              </th>
            ))}
            <th className="p-2 border border-gray-300 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((row, index) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {enableCheckbox && (
                <td className="p-4 border border-gray-300 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows?.includes(row.id)}
                    onChange={(e) =>
                      handleCheckboxChange(row.id, e.target.checked)
                    }
                    disabled={row?.roles?.includes("ADMIN")}
                    className="w-6 h-6 cursor-pointer"
                    title={
                      row?.roles?.includes("ADMIN")
                        ? "Không thể chọn bản ghi này"
                        : ""
                    }
                  />
                </td>
              )}
              <td className="p-2 border border-gray-300 text-center">
                {(currentPage - 1) * pageSize + index + 1}
              </td>
              {columns.map((col) => (
                <td key={col.accessor} className="p-2 border border-gray-300">
                  {[
                    "contactFacebook",
                    "contactInstagram",
                    "contactTelegram",
                    "digitalSpotify",
                    "digitalAppleMusic",
                    "digitalTiktok",
                  ].includes(col.accessor) ? (
                    // Hiển thị tên dễ hiểu và mở link với giá trị
                    <button
                      onClick={() =>
                        handleRedirect(
                          row[col.accessor],
                          formatColumnName(col.accessor)
                        )
                      }
                      className="text-blue-500 underline hover:text-blue-700"
                    >
                      {formatColumnName(col.accessor)}
                    </button>
                  ) : col.accessor === "pdfUrl" ? (
                    <a
                      href={row[col.accessor]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline hover:text-blue-700"
                    >
                      Click Asset PDF
                    </a>
                  ) : (
                    row[col.accessor]
                  )}
                </td>
              ))}

              <td className="p-2 border border-gray-300 text-center">
                {/* Nút Edit */}
                <button
                  className={`text-blue-500 hover:text-blue-700 mx-1 ${
                    row?.email?.includes("admin")
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => onEdit(row)}
                  disabled={row?.email?.includes("admin")}
                  title={
                    row?.email?.includes("admin")
                      ? "Không thể chỉnh sửa bản ghi này"
                      : ""
                  }
                >
                  {actionIcons?.edit}
                </button>

                {/* Nút Delete */}
                <button
                  className={`text-red-500 hover:text-red-700 mx-1 ${
                    row?.email?.includes("admin")
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => onDelete(row)}
                  disabled={row?.email?.includes("admin")}
                  title={
                    row?.email?.includes("admin")
                      ? "Không thể xóa bản ghi này"
                      : ""
                  }
                >
                  {actionIcons?.delete}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4 select-none">
        <div className="md:flex gap-1 items-center hidden sm:block">
          Page <div className="font-medium">{currentPage}</div> of total{" "}
          <div className="font-medium">{totalPages}</div>
        </div>

        <div className="pagination-container flex items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="px-3 py-1 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {getPageNumbers().map((number) => (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`px-3 py-1 hover:bg-gray-100 ${
                currentPage === number ? "bg-gray-200" : ""
              }`}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="px-3 py-1 disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;
