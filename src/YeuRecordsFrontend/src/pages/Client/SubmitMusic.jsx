import React, { useState, useRef, useEffect } from "react";
import logo from "../../assets/images/logoEDM.png";
import backgroundSubmit from "../../assets/images/bacground-submit.png";
import path from "../../utils/path";
import { Link, useNavigate } from "react-router-dom";
import icons from "../../utils/icon";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import CryptoJS from "crypto-js";

import {
  apiCreateMusic,
  uploadFileToCloudinary,
  apiGetAllCategory,
  apiGetSignatureById,
} from "../../apis";

const paths = {
  Home: path.HOME,
};

const {
  IoIosClose,
  MdOutlineCloudUpload,
  MdOutlineFileUpload,
  CiCirclePlus,
  PiWarningCircleFill,
} = icons;

const SubmitMusic = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseModal = () => setIsModalOpen(false);
  const inputFileRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dataCategory, setDataCategory] = useState([]);
  const [categoryId, setCategoryId] = useState();
  const [fileImage, setFileImage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [dataSignature, setDataSignature] = useState();

  const fetchDataCategory = async () => {
    try {
      const response = await apiGetAllCategory(0, -1);
      if (response.status === 200) {
        setDataCategory(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDataCategory();
  }, []);

  const fetchDataSignature = async () => {
    try {
      const dataArtist = JSON.parse(localStorage.getItem("userInfo"));
      const response = await apiGetSignatureById(dataArtist?.userId);

      const dataSignatureCustom = {
        certificate: response?.data.result.certificate,
        digitalSignature: response?.data.result.digitalSignature,
        publicKey: response?.data.result.publicKey,
      };

      setDataSignature(dataSignatureCustom);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDataSignature();
  }, []);

  // xử lý tải hoặc thả file nhạc
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/mpeg": [],
      "audio/wav": [],
    },
    maxSize: 150 * 1024 * 1024,
    onDropAccepted: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setSelectedFile(file);
    },
    onDropRejected: (rejectedFiles) => {
      const file = rejectedFiles[0];
      if (file) {
        if (file.errors[0]?.code === "file-invalid-type") {
          toast.error("Invalid file type. Only MP3 and WAV files are allowed.");
        } else if (file.errors[0]?.code === "file-too-large") {
          toast.error("File is too large. Maximum size is 150MB.");
        } else {
          toast.error("File upload failed. Please try again.");
        }
      }
    },
  });

  // Hàm xử lý khi người dùng chọn file ảnh
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Hàm xử lý khi người dùng chọn file nhạc
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  // Mã hóa dữ liệu chữ ký với khóa bí mật
  const encryptSignature = (signatureData, secretKey) => {
    return CryptoJS.AES.encrypt(signatureData, secretKey).toString();
  };

  const embedSignatureInMp3 = async (
    file,
    musicName,
    digitalSignature,
    publicKey,
    certificate,
    secretKey
  ) => {
    const fileBuffer = await file.arrayBuffer();

    // Chuẩn bị dữ liệu chữ ký số dưới dạng JSON
    const signatureData = JSON.stringify({
      musicName,
      digitalSignature,
      publicKey,
      certificate,
    });

    // Mã hóa dữ liệu chữ ký
    const encryptedSignature = encryptSignature(signatureData, secretKey);

    // Mã hóa Base64 dữ liệu đã mã hóa
    const encodedSignature = btoa(
      unescape(encodeURIComponent(encryptedSignature))
    ); // Đảm bảo không lỗi ký tự đặc biệt
    const signaturePrefix = "SIGNATURE";

    // Tạo buffer mới để kết hợp dữ liệu gốc + chữ ký
    const combinedBuffer = new Uint8Array(
      fileBuffer.byteLength + signaturePrefix.length + encodedSignature.length
    );

    // Sao chép dữ liệu file gốc
    combinedBuffer.set(new Uint8Array(fileBuffer), 0);

    // Sao chép chuỗi "SIGNATURE"
    combinedBuffer.set(
      Uint8Array.from(
        signaturePrefix.split("").map((char) => char.charCodeAt(0))
      ),
      fileBuffer.byteLength
    );

    // Sao chép dữ liệu chữ ký
    combinedBuffer.set(
      Uint8Array.from(
        encodedSignature.split("").map((char) => char.charCodeAt(0))
      ),
      fileBuffer.byteLength + signaturePrefix.length
    );

    // Trả về file mới
    return new File([combinedBuffer], file.name, { type: file.type });
  };

  const handleMusicSubmit = async (values, { resetForm }) => {
    if (!selectedFile) {
      toast.error("Please upload a music file before submitting.");
      return;
    }

    if (!fileImage) {
      toast.error("Please upload an image before submitting.");
      return;
    }

    try {
      setIsLoading(true);

      if (
        !(selectedFile instanceof File) ||
        !selectedFile.type.startsWith("audio/")
      ) {
        toast.error("Invalid music file.");
        return;
      }

      if (
        !(fileImage instanceof File) ||
        !fileImage.type.startsWith("image/")
      ) {
        toast.error("Invalid image file.");
        return;
      }

      if (
        !dataSignature ||
        !dataSignature.digitalSignature ||
        !dataSignature.publicKey ||
        !dataSignature.certificate
      ) {
        toast.error(
          "Digital signature data is missing. Please refresh the page."
        );
        return;
      }

      const { digitalSignature, publicKey, certificate } = dataSignature;
      const secretKey = import.meta.env.VITE_SECRET_KEY;

      if (!secretKey) {
        toast.error("Secret key is missing in environment variables.");
        return;
      }

      // Lấy tên nhạc từ form
      const musicName = values.trackName;

      // Nhúng chữ ký vào file nhạc
      const signedFile = await embedSignatureInMp3(
        selectedFile,
        musicName, // Truyền musicName vào
        digitalSignature,
        publicKey,
        certificate,
        secretKey
      );

      // Upload file nhạc đã nhúng chữ ký lên Cloudinary
      const musicResponse = await uploadFileToCloudinary(
        signedFile,
        "musicFile"
      );

      // Upload ảnh lên Cloudinary
      const imageMusicResponse = await uploadFileToCloudinary(
        fileImage,
        "imgMusic"
      );

      // Gửi thông tin nhạc lên backend
      const dataArtist = JSON.parse(localStorage.getItem("userInfo"));
      const musicDataApi = {
        musicName: values.trackName,
        description: values.description,
        categoryId: categoryId,
        thumbnailUrl: imageMusicResponse.secure_url,
        musicUrl: musicResponse.secure_url,
        userId: dataArtist?.userId,
        fileFormat: selectedFile.type,
      };

      const response = await apiCreateMusic(musicDataApi);
      if (response.status === 201) {
        toast.success("Music submitted successfully.");
        resetForm();
        setSelectedFile(null);
        setSelectedImage(null);
        handleCloseModal();

        const newMusicId = response.data.result.id;
        const musicDataStorage = {
          musicId: newMusicId,
        };

        localStorage.removeItem("submittedMusicData");
        localStorage.setItem(
          "submittedMusicData",
          JSON.stringify([musicDataStorage])
        );

        navigate("/license-music");
      }
    } catch (error) {
      console.error("Error during file processing:", error);
      if (error.response) {
        console.error("Error response:", error.response);
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("An error occurred while processing the files.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="flex gap-10 w-screen h-screen justify-center items-center"
        style={{
          backgroundImage: `url(${backgroundSubmit})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col justify-center items-center w-full h-full select-none">
          <div className="flex gap-3 justify-center items-center md:flex-row flex-col">
            <div>
              <Link
                to={paths.Home}
                className="flex md:flex-row flex-col gap-6 items-center md:w-full cursor-pointer justify-center text-center"
              >
                <div className="w-[170px] h-[170px] rounded-[50%]">
                  <img
                    className="w-[170px] h-[170px] rounded-[50%]"
                    src={logo}
                    alt="logo"
                  />
                </div>
                <div className="font-semibold text-[56px] text-[#fff]">YRC</div>
              </Link>
            </div>
          </div>

          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-[#fff] h-[411px] md:w-[902px] w-[96%] rounded-[6px] py-4 px-6 mt-[40px] group"
          >
            <div className="w-full h-full border-dashed border-2 border-[#d5d5d6] flex items-center justify-center md:p-0 p-3">
              <div>
                <div className="flex justify-center cursor-pointer group">
                  <CiCirclePlus
                    className="transition-all duration-500 group-hover:scale-110 group-hover:text-[#232a39] text-[#90949c]"
                    size="58px"
                  />
                </div>

                <div className="flex justify-center flex-col items-center mt-9">
                  <div className="font-bold text-[#232a39] text-[35px] text-center">
                    Click here to open the form
                  </div>
                  <div className="text-[#818a91] font-light mt-4 text-[15px] text-center">
                    MP3 or WAV only. Your track will be uploaded to our servers.
                  </div>
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-[#818a91] font-light leading-8 text-[15px] break-words w-full">
                      By uploading you agree to our
                    </div>
                    <div className="cursor-pointer text-[15px] font-light leading-8 underline underline-offset-4 break-words w-full">
                      terms of service.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* modal */}
      {isModalOpen && (
        <Formik
          initialValues={{
            trackName: "",
            description: "",
            category: "",
          }}
          validationSchema={Yup.object({
            trackName: Yup.string()
              .min(3, "Track name must be at least 3 characters")
              .required("Track name is required"),
          })}
          onSubmit={handleMusicSubmit}
        >
          {({ setFieldValue }) => (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white md:w-[68%] w-[95%] h-[94%]  p-6 rounded-[8px] shadow-lg relative overflow-y-auto">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  <IoIosClose size="28px" />
                </button>

                <h2 className="text-xl font-bold">Submit data music</h2>

                <Form className="mt-4">
                  <div className="flex gap-3 flex-wrap">
                    <div>
                      <Field
                        name="trackName"
                        type="text"
                        placeholder="trackname"
                        className="bg-[#eee] outline-none px-[16px] py-[10px] w-[322px] md:w-[458px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                      />
                      <ErrorMessage
                        name="trackName"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <Field
                        name="category"
                        as="select"
                        className="bg-[#eee] outline-none px-[16px] py-[10px] w-[322px] md:w-[458px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                        onChange={(e) => {
                          const selectedCategoryId = e.target.value;
                          setCategoryId(selectedCategoryId);
                          setFieldValue("category", selectedCategoryId);
                        }}
                      >
                        <option value="" disabled>
                          Select your category
                        </option>
                        {dataCategory.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.categoryName}
                          </option>
                        ))}
                      </Field>
                    </div>
                    <div className="w-full">
                      <Field
                        name="description"
                        as="textarea"
                        placeholder="If your song features another artist, please credit that artist, separated by commas. (option)"
                        rows="4"
                        className="bg-[#eee] outline-none px-[16px] h-[60px] py-[10px] w-[322px] md:w-full rounded-[14px] text-[14px] placeholder:text-[#828181]"
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div
                    className="mt-4 flex flex-col gap-3 justify-center items-center h-[220px] border-dashed border-2 border-[#d5d5d6] w-full rounded-[6px]"
                    {...getRootProps()}
                  >
                    <div>
                      <MdOutlineCloudUpload color="#5e5b5b" size="52px" />
                    </div>
                    <div className="font-light text-[15px] text-[#5e5b5b]">
                      Drag & Drop File Here
                    </div>
                    <div className="font-light text-[15px] text-[#5e5b5b]">
                      OR
                    </div>
                    <div className="w-[300px] flex flex-col justify-center items-center">
                      <input
                        {...getInputProps()}
                        name="submitFile"
                        type="file"
                        id="submitFile"
                        className="hidden"
                        ref={inputFileRef}
                        onChange={handleFileChange}
                      />
                      <label
                        className="bg-[#fff] font-thin text-[15px] text-[#5e5b5b] border border-[#5e5b5b] border-solid outline-none px-[10px] py-[10px] rounded-[14px] text-center cursor-pointer w-[110px]"
                        onClick={() => {
                          inputFileRef.current.click();
                        }}
                      >
                        Browse files
                      </label>
                    </div>

                    <div className="text-sm text-[#232b31] font-normal my-2 text-center">
                      {selectedFile
                        ? `Selected file: ${selectedFile.name}`
                        : "No file selected"}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-center items-center">
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="imageUpload"
                      />

                      {/* Khung tròn với icon */}
                      <label
                        htmlFor="imageUpload"
                        className="w-[100px] h-[100px] bg-[#f0f0f0] border border-[#d5d5d6] rounded-full flex justify-center items-center cursor-pointer hover:bg-[#e9e9e9] transition duration-200"
                      >
                        {/* Icon Upload */}
                        {!selectedImage && (
                          <div className="text-[#5e5b5b] flex flex-col justify-center items-center">
                            <MdOutlineFileUpload size="30px" />
                            <div className="text-xs mt-2">Music photo</div>
                          </div>
                        )}

                        {/* Nếu đã có ảnh, hiển thị ảnh trong khung tròn */}
                        {selectedImage && (
                          <img
                            src={selectedImage}
                            alt="Selected Image"
                            className="w-full h-full object-cover rounded-full"
                          />
                        )}
                      </label>

                      <ErrorMessage
                        name="image"
                        component="div"
                        className="text-red-500 text-sm mt-1 text-center"
                      />
                    </div>
                    <div className=" flex items-center text-[#6c757d] p-4 rounded-lg shadow-sm">
                      <PiWarningCircleFill
                        size={22}
                        className="mr-3 text-[#232a39]"
                      />
                      <div className="text-sm">
                        <strong className="font-semibold">
                          Important Note:
                        </strong>{" "}
                        Please consider naming and uploading photos carefully,
                        as the system does not allow editing.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end mt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className={`bg-[#000] text-white px-4 py-2 rounded-[8px]`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="saving-text">
                            Submit <span className="dot">.</span>
                            <span className="dot">.</span>
                            <span className="dot">.</span>
                          </span>
                        </>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          )}
        </Formik>
      )}
    </>
  );
};

export default SubmitMusic;
