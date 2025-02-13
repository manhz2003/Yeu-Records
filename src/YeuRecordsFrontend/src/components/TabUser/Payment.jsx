import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  apiCreateOrUpdatePaymentInfo,
  apiGetPaymentInfoById,
} from "../../apis/payment";

const Payment = () => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [paypalId, setPaypalId] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(false);

  // Fetch ngân hàng từ API
  useEffect(() => {
    // Gọi API lấy danh sách ngân hàng
    axios
      .get("https://api.vietqr.io/v2/banks")
      .then((response) => {
        if (response.data.code === "00" && Array.isArray(response.data.data)) {
          setBanks(response.data.data);
        }
      })
      .catch((err) => console.error(err));

    // Lấy thông tin thanh toán của người dùng
    const fetchPaymentInfo = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const response = await apiGetPaymentInfoById(userInfo.userId);
        if (response.status === 200) {
          setPaymentInfo(response.data.result);
        } else {
          toast.error("User not found.");
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("User not found.");
        } else {
          console.error("An error occurred:", error);
        }
      }
    };

    fetchPaymentInfo();
  }, [updateTrigger]);

  const handleBankChange = (e) => {
    const selectedBank = banks.find((bank) => bank.name === e.target.value);
    setSelectedBank(selectedBank || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      // Tạo payload dựa trên phương thức thanh toán
      const payload = {
        userId: userInfo.userId,
        bankName: selectedBank?.name || "",
        bankCode: selectedBank?.code || "",
        accountName: accountName || "",
        accountNumber: accountNumber || "",
        paypalInfo: paypalId || "",
      };

      const response = await apiCreateOrUpdatePaymentInfo(payload);
      if (response.status === 200) {
        toast.success("Payment info updated successfully!");
        setUpdateTrigger((prev) => !prev);
      }
    } catch (error) {
      if (error.response) {
        console.log("Error response:", error.response);
        if (error.response.status === 409) {
          toast.error(error.response.data.message);
        }

        if (error.response.status === 404) {
          toast.error("User not found.");
        }
      } else {
        console.log("Error message:", error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-full ">
      <div
        className="w-full flex bg-white overflow-y-auto scrollbar-visible"
        style={{
          maxHeight: "350px",
          paddingRight: "8px",
        }}
      >
        <div className="md:w-[919px] md:flex">
          <div className="md:w-2/3">
            <div className="text-[18px] font-bold my-2">
              Payment information
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="mt-2 flex items-center gap-8">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <label htmlFor="bank" className="">
                        You can fill in paypal or bank information, or both if
                        available.
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">ID PayPal</label>
                <input
                  type="text"
                  name="paypalId"
                  value={paypalId}
                  onChange={(e) => setPaypalId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Choose a bank
                </label>
                <select
                  name="bank"
                  onChange={handleBankChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                >
                  <option value="">-- Choose a bank --</option>
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.name}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBank && (
                <div className="mb-4 text-center">
                  <img
                    src={selectedBank.logo}
                    alt={selectedBank.name}
                    className="mx-auto mb-2 w-16 h-16 object-contain"
                  />
                  <p className="text-lg font-semibold">{selectedBank.name}</p>
                  <p className="text-sm text-gray-600">
                    Bank code: {selectedBank.code}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Account number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Account name
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                />
              </div>

              <div className="mb-4">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-[#000] text-white rounded-md"
                >
                  Update
                </button>
              </div>
            </form>
          </div>

          {/* Hiển thị thông tin tài khoản người dùng */}
          <div className="md:w-1/3 md:ml-6 p-4 rounded-md text-[16px] shadow">
            <div className="font-semibold text-[18px] mb-2">
              Account information
            </div>
            <div className="leading-7">
              {paymentInfo ? (
                <>
                  <p>
                    <strong>Account name:</strong>{" "}
                    <span className="underline italic">
                      {paymentInfo.accountName}
                    </span>
                  </p>
                  <p>
                    <strong>Account number:</strong>{" "}
                    <span className="underline italic">
                      {paymentInfo.accountNumber}
                    </span>
                  </p>
                  <p>
                    <strong>Bank name:</strong>{" "}
                    <span className="underline italic">
                      {paymentInfo.bankName}
                    </span>
                  </p>
                  <p>
                    <strong>Bank code:</strong>{" "}
                    <span className="underline italic">
                      {paymentInfo.bankCode}
                    </span>
                  </p>
                  <p>
                    <strong>Email or id paypal:</strong>{" "}
                    <span className="underline italic">
                      {paymentInfo.paypalInfo}
                    </span>
                  </p>

                  <p>
                    <strong>Payment status:</strong>{" "}
                    <span className="underline italic">
                      {paymentInfo.paymentStatus ? "Pending" : "Paid"}
                    </span>
                  </p>
                </>
              ) : (
                <p>No payment information yet...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
