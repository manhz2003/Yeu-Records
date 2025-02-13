import axios from "axios";

// call api xóa nền ảnh của bên thứ 3 removebg
export const removeBackground = async (file) => {
  const formData = new FormData();
  formData.append("image_file", file);
  formData.append("size", "auto");

  const response = await axios.post(
    "https://api.remove.bg/v1.0/removebg",
    formData,
    {
      headers: {
        "X-Api-Key": "DRieYjCTkXsuGxxNdgHkqnBM",
      },
      responseType: "blob",
    }
  );

  const imageUrl = URL.createObjectURL(response.data);
  return imageUrl;
};
