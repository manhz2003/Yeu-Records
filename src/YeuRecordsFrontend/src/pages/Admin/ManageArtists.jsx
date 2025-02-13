import { useState, useEffect } from "react";
import icons from "../../utils/icon";
import Swal from "sweetalert2";
import { Table } from "../../components/index";
import { toast } from "react-toastify";

import {
  apiUpdatePaymentStatus,
  apiGetDataManagerArtist,
  apiDeleteUser,
  apiGrantRoles,
  apiLockOrUnLock,
} from "../../apis";

import { apiGetAllRole } from "../../apis/role";
import { exportToExcel } from "../../utils/helper";

const {
  FaUsers,
  RiUserLocationLine,
  RxValueNone,
  FaUserLock,
  CiExport,
  CiLock,
  CiUnlock,
  FaUserPen,
  IoSearch,
  FiUserPlus,
  FiTrash,
  MdPayments,
} = icons;

const ManageArtists = () => {
  const [searchValue, setSearchValue] = useState("");
  const [dataManagerArtist, setDataManagerArtist] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataRole, setDataRole] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterUser, setFilterUser] = useState("");

  const handleClearInput = () => {
    setSearchValue("");
  };

  const handleRoleFilterChange = (event) => {
    setFilterRole(event.target.value);
  };

  const handleFilterUser = (event) => {
    setFilterUser(event.target.value);
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

  const fetchDataManagerArtist = async () => {
    try {
      const response = await apiGetDataManagerArtist(currentPage - 1, pageSize);
      if (response.status === 200) {
        setDataManagerArtist(response.data.result);
        setTotalItems(response.data.result.totalUser);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // api get all role
  const fethDataRole = async () => {
    try {
      const response = await apiGetAllRole();
      if (response.status === 200) {
        setDataRole(response.data.result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fethDataRole();
  }, []);

  // api thống kê
  useEffect(() => {
    fetchDataManagerArtist();
  }, [currentPage, pageSize]);

  // xử lý xóa user
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
        apiDeleteUser(row.id)
          .then((response) => {
            if (response.status === 204) {
              Swal.fire(
                "Deleted!",
                "The artist has been deleted successfully.",
                "success"
              );
              fetchDataManagerArtist();
            }
          })
          .catch((error) => {
            console.log("Error deleting user:", error);
          });
      } else {
        console.log("Deletion cancelled");
      }
    });
  };

  const columns = [
    { accessor: "roles", label: "Roles" },
    { accessor: "fullname", label: "Full Name" },
    { accessor: "email", label: "Email" },
    { accessor: "accountName", label: "Account Name" },
    { accessor: "accountNumber", label: "Account Number" },
    { accessor: "bankCode", label: "Bank Code" },
    { accessor: "bankName", label: "Bank Name" },
    { accessor: "paymentStatus", label: "Payment Status " },
    { accessor: "status", label: "Status" },
    { accessor: "statusOnline", label: "Online" },
    { accessor: "lockout", label: "Lockout" },
    { accessor: "totalMusic", label: "Total Music" },
    { accessor: "dob", label: "DOB" },
    { accessor: "address", label: "Address" },
    { accessor: "phone", label: "Phone" },
    { accessor: "oauthProvider", label: "OAuth Provider" },
    { accessor: "contactFacebook", label: "Facebook" },
    { accessor: "contactInstagram", label: "Instagram" },
    { accessor: "contactTelegram", label: "Telegram" },
    { accessor: "digitalSpotify", label: "Spotify" },
    { accessor: "digitalAppleMusic", label: "Apple Music" },
    { accessor: "digitalTiktok", label: "TikTok" },
    { accessor: "activeEmail", label: "Active Email" },
    { accessor: "createdAt", label: "Created At" },
    { accessor: "updatedAt", label: "Updated At" },
  ];

  // tùy biến dữ liệu
  const dataUser = dataManagerArtist.users?.map((user) => ({
    ...user,
    roles: user.roles.map((role) => role.name).join(", "),
    statusOnline: user.statusOnline ? "True" : "False",
    status:
      user.status === 0 ? "Inactive" : user.status === 1 ? "Active" : "Locked",
    activeEmail: user.activeEmail ? "True" : "False",
    lockout: user.lockout ? "True" : "False",

    // Lấy thông tin payment từ paymentInfos
    bankName: user.paymentInfos?.[0]?.bankName || "",
    bankCode: user.paymentInfos?.[0]?.bankCode || "",
    accountName: user.paymentInfos?.[0]?.accountName || "",
    accountNumber: user.paymentInfos?.[0]?.accountNumber || "",
    paypalInfo: user.paymentInfos?.[0]?.paypalInfo || "",
    paymentStatus:
      user.paymentInfos?.[0]?.paymentStatus === "false"
        ? "Pending"
        : user.paymentInfos?.[0]?.paymentStatus === "true"
        ? "Paid"
        : "",
  }));

  // Lọc dữ liệu theo fullname
  const filteredData = dataUser?.filter((user) => {
    // Kiểm tra fullname, nếu không có thì gán giá trị mặc định là chuỗi rỗng
    const matchesSearch = (user.fullname || "")
      .toLowerCase()
      .includes(searchValue.toLowerCase());

    // Kiểm tra xem filterRole có khớp với bất kỳ vai trò nào trong user.roles không
    const matchesRole = filterRole
      ? (user.roles || "").toLowerCase().includes(filterRole.toLowerCase())
      : true;

    // Kiểm tra điều kiện lọc người dùng (online, locked, etc.)
    const matchesUserFilter =
      filterUser === "locked"
        ? user.status === "locked"
        : filterUser === "online"
        ? user.status === "Active" && user.statusOnline === "True"
        : true;

    return matchesSearch && matchesRole && matchesUserFilter;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = e.target.value;
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleExport = () => {
    exportToExcel(filteredData);
  };

  const handleRoleCheckboxChange = (role, isChecked) => {
    setSelectedRole((prev) =>
      isChecked ? [...prev, role] : prev.filter((r) => r !== role)
    );
  };

  // Hàm cấp quyền
  const handleGrantRoles = async () => {
    if (selectedRows.length === 0 || selectedRole.length === 0) {
      toast.error("Please select user and permissions.");
      return;
    }

    // Đảm bảo roles là một mảng
    const rolesArray = Array.isArray(selectedRole)
      ? selectedRole
      : [selectedRole];

    const payload = {
      userIds: selectedRows,
      roles: rolesArray,
    };

    try {
      const response = await apiGrantRoles(payload);
      if (response.status === 200) {
        toast.success("Authorization successful");
        fetchDataManagerArtist();
      }
    } catch (error) {
      if (error.status === 400) {
        console.log(error.response.data.message);
      }
      console.log(error);
    }
  };

  const handleLockOrUnlock = async (status) => {
    if (selectedRows.length === 0) {
      toast.error("Please select a user.");
      return;
    }

    const actionMessage = status === 1 ? "unlocked" : "locked";
    const payload = {
      userIds: selectedRows,
      status: status,
    };

    try {
      const response = await apiLockOrUnLock(payload);
      if (response.status === 200) {
        toast.success(`Account ${actionMessage} successfully`);
        fetchDataManagerArtist();
      }
    } catch (error) {
      if (error.status === 400) {
        console.log(error.response.data.message);
      }
      console.log(error);
    }
  };

  // Mở khóa
  const handleUnLocked = () => {
    handleLockOrUnlock(1);
  };

  // Khóa
  const handleLocked = () => {
    handleLockOrUnlock(2);
  };

  // trạng thái thanh toán
  const handlePaymentStatus = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select a user.");
      return;
    }

    try {
      const response = await apiUpdatePaymentStatus(selectedRows);
      if (response.status === 200) {
        console.log(response);
        toast.success("payment status update successful!");
        fetchDataManagerArtist();
      }
    } catch (error) {
      toast("Artist has not filled out their account information");
      console.log(error);
    }
  };

  return (
    <>
      <div className="p-4 flex flex-col gap-3 ">
        <div className="w-full flex flex-col gap-4 bg-[#fff] rounded-[6px] text-[#fff] shadow p-4 select-none">
          <div className="text-[#000] font-medium text-[17px]">
            Statistical Artist
          </div>
          <div className="md:flex md:gap-4 items-center gap-8 flex-wrap">
            <div className="flex flex-col items-center gap-2 p-4 bg-[#4C8BF5] rounded-[6px] shadow md:w-[216px]">
              <div className="flex items-center gap-2">
                <FaUsers />
                <div>Total Artist</div>
              </div>
              <div>{dataManagerArtist.totalUser}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#8BC34A] rounded-[6px] shadow md:my-0 my-2 md:w-[216px]">
              <div className="flex items-center gap-2">
                <RiUserLocationLine />
                <div>Artist Online</div>
              </div>
              <div>{dataManagerArtist.totalUserOnline}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#FF7043] rounded-[6px] shadow md:my-0 my-2 md:w-[216px]">
              <div className="flex items-center gap-2">
                <RxValueNone />
                <div>Account none active</div>
              </div>
              <div>{dataManagerArtist.totalUserNonActive}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#26C6DA] rounded-[6px] shadow md:my-0 my-2 md:w-[216px]">
              <div className="flex items-center gap-2">
                <FiUserPlus />
                <div>New Accounts Today</div>
              </div>
              <div>{dataManagerArtist.totalAccountNewToday}</div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 bg-[#546E7A] rounded-[6px] shadow md:w-[216px]">
              <div className="flex items-center gap-2">
                <FaUserLock />
                <div>Account lock</div>
              </div>
              <div>{dataManagerArtist.totalAccountLocker}</div>
            </div>
          </div>
        </div>
        <div className="w-full shadow p-4 rounded-[6px] bg-[#fff] flex flex-col gap-3 select-none">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex items-center gap-2 p-3 bg-[#000] text-[#fff] rounded-[6px] cursor-pointer sm:w-auto w-full"
              onClick={handleLocked}
            >
              <CiLock />
              <div>Locked</div>
            </div>

            <div
              className="flex items-center gap-2 p-3 bg-[#000] text-[#fff] rounded-[6px] cursor-pointer sm:w-auto w-full"
              onClick={handleUnLocked}
            >
              <CiUnlock />
              <div>Unlocked</div>
            </div>

            <div
              className="flex items-center gap-2 p-3 bg-[#000] text-[#fff] rounded-[6px] cursor-pointer sm:w-auto w-full"
              onClick={handleExport}
            >
              <CiExport />
              <div>Export</div>
            </div>

            <div
              className="flex items-center gap-2 p-3 bg-[#000] text-[#fff] rounded-[6px] cursor-pointer sm:w-auto w-full"
              onClick={handlePaymentStatus}
            >
              <MdPayments />
              <div>Payment status</div>
            </div>

            <div
              className="flex items-center gap-2 p-3 bg-[#000] text-[#fff] rounded-[6px] cursor-pointer sm:w-auto w-full"
              onClick={handleGrantRoles}
            >
              <FaUserPen />
              <div>Grant Roles</div>
            </div>

            <div className="flex gap-4">
              {dataRole.map((role) => (
                <label
                  key={role.name}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={role.name}
                    checked={selectedRole.includes(role.name)}
                    onChange={(e) =>
                      handleRoleCheckboxChange(e.target.value, e.target.checked)
                    }
                    className="hidden"
                  />
                  <span
                    className={`w-5 h-5 flex justify-center items-center border-2 rounded-md ${
                      selectedRole.includes(role.name)
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedRole.includes(role.name) && "✓"}
                  </span>
                  <span>{role.name}</span>
                </label>
              ))}
            </div>

            <select
              value={filterUser}
              onChange={handleFilterUser}
              className="bg-[#f3f1f1] py-[11px] px-4 rounded-md outline-none md:w-[175px] w-full"
            >
              <option value="" disabled>
                Filter Artist
              </option>
              <option value="all">Artist List</option>
              <option value="locked">List of locked accounts</option>
              <option value="online">List Artist online</option>
            </select>

            <select
              value={filterRole}
              onChange={handleRoleFilterChange}
              className="bg-[#f3f1f1] py-[11px] px-4 rounded-md outline-none md:w-[175px] w-full"
            >
              <option value="" disabled>
                Filter Role
              </option>
              {dataRole.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.name}
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
            data={filteredData}
            columns={columns}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            enableCheckbox={true}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            onCheckboxChange={handleCheckboxChange}
            actionIcons={{ delete: <FiTrash /> }}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </>
  );
};

export default ManageArtists;
