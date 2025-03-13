import instance from "../axios";

export const apiGetAllRole = () =>
  instance({
    url: `/roles`,
    method: "get",
  });
