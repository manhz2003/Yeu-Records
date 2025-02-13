import instance from "../axios";

export const apiGetCategoryStatistics = () =>
  instance({
    url: `/categories/statistics`,
    method: "get",
  });

export const apiGetAllCategory = (page, size) =>
  instance({
    url: `/categories?page=${page}&size=${size}`,
    method: "get",
  });

export const apiDeleteCategoryById = (id) =>
  instance({
    url: `/categories/${id}`,
    method: "delete",
  });

export const apiCreateCategory = async (data) => {
  try {
    const response = await instance.post(`/categories`, data);
    return response;
  } catch (error) {
    console.log("API Error:", error);
    throw error;
  }
};

export const apiUpdateCategoryById = async (id, data) => {
  try {
    const response = await instance.put(`/categories/${id}`, data);
    return response;
  } catch (error) {
    console.log("API Error:", error);
    throw error;
  }
};
