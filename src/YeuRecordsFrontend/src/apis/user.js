import instance from "../axios";

export const apiCreateUser = (data) =>
  instance({
    url: "/users",
    method: "post",
    data,
  });

export const apiGetUserById = (id) =>
  instance({
    url: `/users/${id}`,
    method: "get",
  });

export const apiUpdateUserById = async (id, data) => {
  try {
    const response = await instance.put(`/users/${id}`, data);
    return response;
  } catch (error) {
    console.log("API Error:", error);
    throw error;
  }
};

export const apiGetListFeaturedArtist = (limit) =>
  instance({
    url: `/users/featured?limit=${limit}`,
    method: "get",
  });

export const apiGetDataManagerArtist = (page, size) =>
  instance({
    url: `/users?page=${page}&size=${size}`,
    method: "get",
  });

export const apiDeleteUser = (id) =>
  instance({
    url: `/users/${id}`,
    method: "delete",
  });

export const apiGrantRoles = (data) =>
  instance({
    url: `/users/grant-roles`,
    data,
    method: "put",
  });

export const apiLockOrUnLock = (data) =>
  instance({
    url: `/users/lock-unlock`,
    data,
    method: "put",
  });
