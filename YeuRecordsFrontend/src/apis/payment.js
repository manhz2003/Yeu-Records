import instance from "../axios";

export const apiCreateOrUpdatePaymentInfo = async (data) => {
  try {
    const response = await instance.post("/payment-info", data);
    return response;
  } catch (error) {
    console.log("API Error:", error);
    throw error;
  }
};

export const apiGetPaymentInfoById = (id) =>
  instance({
    url: `/payment-info/${id}`,
    method: "get",
  });
