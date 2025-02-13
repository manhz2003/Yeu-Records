import axios from "axios";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dvir2hzdf";
const UPLOAD_PRESET = "yeurecord";

export const uploadFileToCloudinary = async (file, folder = "") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  if (folder) formData.append("folder", folder);

  try {
    const response = await axios.post(
      `${CLOUDINARY_URL}/raw/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error uploading file to Cloudinary:",
      error.response?.data || error.message
    );
    throw error;
  }
};
