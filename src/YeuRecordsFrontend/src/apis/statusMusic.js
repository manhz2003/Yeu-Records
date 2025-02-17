import instance from "../axios";

export const apiGetAllStatusMusic = () =>
  instance({
    url: `/status-music`,
    method: "get",
  });
