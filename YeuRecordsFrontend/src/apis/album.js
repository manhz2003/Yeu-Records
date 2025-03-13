import instance from "../axios";

export const apiCreateAlbum = async (id, data) => {
  try {
    const response = await instance.post(`/albums/${id}`, data);
    return response;
  } catch (error) {
    console.log("API Error:", error);
    throw error;
  }
};

export const apiUpdateAlbumById = async (idUser, idAlbum, data) => {
  try {
    const response = await instance.put(`/albums/${idUser}/${idAlbum}`, data);
    return response;
  } catch (error) {
    console.log("API Error:", error);
    throw error;
  }
};

export const apiGetAllAlbumByIdUser = (id) =>
  instance({
    url: `/albums/${id}`,
    method: "get",
  });

export const apiGetAllAlbum = () =>
  instance({
    url: `/albums`,
    method: "get",
  });

export const apiDeleteAlbumById = (userId, idAlbum) =>
  instance({
    url: `/albums/${userId}/${idAlbum}`,
    method: "delete",
  });
