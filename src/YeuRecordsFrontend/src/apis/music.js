import instance from "../axios";

export const apiCreateMusic = (data) =>
  instance({
    url: "/music",
    method: "post",
    data,
  });

export const apiGetAllMusicByIdCategory = (id, page, size) => {
  let url = `/music`;

  if (id && id !== "") {
    url += `/${id}`;
  }

  url += `?page=${page}&size=${size}`;

  return instance({
    url: url,
    method: "get",
  });
};

export const apiDeleteMusicById = (id) =>
  instance({
    url: `/music/${id}`,
    method: "delete",
  });

export const apiGetAllMusicByUserIdOrAlbumId = (userId, albumId) =>
  instance({
    url: `/music/user/${userId}?albumId=${albumId}`,
    method: "get",
  });

export const apiUpdateMusicAlbumId = (musicId, albumId) =>
  instance({
    url: `/music/${musicId}/album/${albumId}`,
    method: "put",
  });

export const apiUpdateStatusMusic = (data) =>
  instance({
    url: `music/update-status`,
    data,
    method: "put",
  });

export const apiUpdatePlatformMusic = (id, data) =>
  instance({
    url: `music/${id}/update-platform`,
    data,
    method: "put",
  });
