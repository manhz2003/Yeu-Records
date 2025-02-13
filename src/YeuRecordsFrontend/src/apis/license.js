import instance from "../axios";

export const apiCreateLicense = (data) =>
  instance({
    url: "/license",
    method: "post",
    data,
  });

export const apiGetAllLicense = (page, size) =>
  instance({
    url: `/license?page=${page}&size=${size}`,
    method: "get",
  });

export const apiDeleteLicenseById = (id) =>
  instance({
    url: `/license/${id}`,
    method: "delete",
  });
