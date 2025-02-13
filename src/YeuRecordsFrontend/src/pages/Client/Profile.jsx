import React, { useState, useEffect } from "react";
import { apiGetUserById, apiUpdateUserById } from "../../apis/user";
import logo from "../../assets/images/logoEDM.png";
import avatarAdmin from "../../assets/images/avatar-admin.jpg";
import path from "../../utils/path";
import { Link } from "react-router-dom";
import {
  About,
  Payment,
  PlayMusic,
  SidebarContact,
  SidebarAlbum,
} from "../../components";
import icons from "../../utils/icon";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import { uploadFileToCloudinary } from "../../apis";

const { IoIosClose, MdOutlineFileUpload } = icons;

const paths = {
  Login: path.LOGIN,
  Register: path.REGISTER,
  Home: path.HOME,
  SubmitMusic: path.SUBMIT_MUSIC,
  Artist: path.ARTIST,
  ChangePassWord: path.CHANGE_PASSWORD,
  Profile: path.PROFILE,
};

// Schema validation với Yup
const validationSchema = Yup.object({
  fullname: Yup.string()
    .min(3, "Fullname must be at least 3 characters")
    .required("Fullname is required"),
  address: Yup.string()
    .min(3, "Address must be at least 3 characters")
    .required("Address is required"),
  phone: Yup.string()
    .matches(/^0\d{9}$/, "Phone must be 10 digits and start with 0")
    .required("Phone is required"),
  dob: Yup.date()
    .max(
      new Date(Date.now() - 567648000000),
      "You must be at least 18 years old"
    )
    .required("Date of birth is required"),
  website: Yup.string().url("Website must be a valid URL").notRequired(),
  gender: Yup.string().required("Gender is required"),
  avatar: Yup.mixed()
    .nullable()
    .test(
      "fileSize",
      "File too large. Maximum size is 2MB",
      (value) => !value || (value && value.size <= 2 * 1024 * 1024)
    )
    .test(
      "fileType",
      "Unsupported file format. Only images are allowed",
      (value) =>
        !value ||
        (value && ["image/jpeg", "image/png", "image/jpg"].includes(value.type))
    ),
});

const Profile = () => {
  const [activeTab, setActiveTab] = useState("About");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [dataAlbum, setDataAlbum] = useState();
  const [idAlbum, setIdAlbum] = useState("");

  const handleDataAlbumFromChildOne = (value) => {
    setDataAlbum(value);
  };

  const handleDataAlbumIdFromChildOne = (value) => {
    setIdAlbum(value);
  };

  // api show info profile
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const response = await apiGetUserById(userInfo.userId);
        if (response.status === 200) {
          const updatedUserData = response.data;

          // Cập nhật key userInfo trong localStorage
          const updatedUserInfo = {
            ...userInfo,
            avatar: updatedUserData.avatar || null,
          };

          localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
          setUserData(updatedUserData);
        } else {
          toast.error("User not found.");
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("User not found.");
        } else {
          console.error("An error occurred:", error);
        }
      }
    };

    fetchUserInfo();
  }, []);

  const avatarSrc = userData.avatar || avatarAdmin;

  // api update info profile
  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);

      // Nếu người dùng chọn avatar mới, upload lên Cloudinary
      let avatarUrl = values.avatar
        ? await uploadFileToCloudinary(values.avatar, "imgAvatar")
        : null;

      // Nếu avatar được upload, lấy URL từ response của Cloudinary
      if (avatarUrl) {
        avatarUrl = avatarUrl.secure_url;
      }

      const dob = values.dob
        ? new Date(values.dob).toLocaleDateString("en-GB")
        : "";

      // Chuẩn bị dữ liệu cập nhật
      const updatedUserData = {
        ...values,
        dob,
        avatar: avatarUrl,
        fullname: values.fullname,
      };

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      // Gửi request cập nhật thông tin người dùng lên backend
      const response = await apiUpdateUserById(
        userInfo.userId,
        updatedUserData
      );

      // Kiểm tra kết quả response
      if (response.status === 200) {
        toast.success("Updated successfully");

        // Cập nhật trạng thái userData và localStorage trực tiếp
        const newUserData = { ...userData, ...updatedUserData };
        setUserData(newUserData);

        // Cập nhật localStorage
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            ...userInfo,
            avatar: newUserData.avatar,
            fullname: newUserData.fullname,
          })
        );

        handleCloseModal();
      } else {
        throw new Error("Error updating user information");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
        return;
      }
      toast.error("Update failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "About":
        return <About userData={userData} />;
      case "Music":
        return (
          <PlayMusic
            receivedDataAlbumId={idAlbum}
            receivedDataAlbum={dataAlbum}
          />
        );
      case "Payment":
        return <Payment />;
      default:
        return <About userData={userData} />;
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="md:h-screen md:w-screen">
        <div className="bg-[#f9f9f9] h-full w-full rounded-[6px] flex flex-col p-4 shadow">
          <div>
            <Link
              to={paths.Home}
              className="flex gap-2 items-center md:w-full cursor-pointer"
            >
              <div className="w-[40px] h-[40px] rounded-[50%] ml-[24px]">
                <img
                  className="w-[40px] h-[40px] rounded-[50%]"
                  src={logo}
                  alt="logo"
                />
              </div>
              <div className="font-bold text-[22px]">Yeu Records</div>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:h-[200px] mt-[6px]">
            <div className="md:w-[31%] h-[200px] flex items-center justify-center">
              <div className="h-[188px] w-[188px] rounded-[50%] bg-[#333] select-none">
                <img
                  className="h-[188px] w-[188px] rounded-[50%] select-none pointer-events-none"
                  src={avatarSrc}
                  alt="avatar"
                />
              </div>
            </div>
            <div className="w-full md:w-[69%] h-[200px] bg-[#fefefe] rounded-[8px] p-5 shadow-sm md:mt-0 mt-2">
              <div className="flex flex-col gap-2 select-none">
                <div className="flex gap-5 items-center">
                  <div className="text-[22px] font-bold">
                    {userData.fullname}
                  </div>
                  <div className="text-[12px] text-[#333333] font-bold pt-[5px]">
                    {userData.oauthProvider} Account
                  </div>
                </div>
                <div className="text-[#333333] text-[14px] font-bold">
                  {userData.roles?.[0]?.name === "ADMIN"
                    ? "Administrator"
                    : "Author Artist"}
                </div>
                <div className="flex flex-col gap-3 mt-[14px]">
                  <div className="text-[10px] font-bold text-[#282828]">
                    ISSUANCE
                  </div>
                  <div className="text-[#020202] text-[18px] font-bold">
                    {userData.totalMusic}
                  </div>
                </div>

                <div className="flex gap-4 mt-[16px] font-medium text-[14px]">
                  <Link
                    to={paths.SubmitMusic}
                    className="cursor-pointer bg-[#000] text-[#fff] px-[22px] py-[9px] rounded-[6px]"
                  >
                    Submit
                  </Link>
                  <div
                    onClick={handleOpenModal}
                    className="cursor-pointer px-[22px] py-[9px] bg-[#000] text-[#fff] rounded-[6px]"
                  >
                    Update Profile
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar h-full flex flex-col md:flex-row md:mt-[1px] md:gap-0 gap-1 mt-1">
            {activeTab === "Music" ? (
              <SidebarAlbum
                onDataAlbumIdChange={handleDataAlbumIdFromChildOne}
                onDataAlbumChange={handleDataAlbumFromChildOne}
              />
            ) : (
              <SidebarContact userData={userData} />
            )}

            <div className="h-full w-full md:w-[69%] bg-[#ffff] shadow rounded-[8px] px-5 pt-5 select-none">
              <div className="flex items-center gap-8 text-[14px] font-medium text-[#5b5959]">
                {["About", "Music", "Payment"].map((tab) => (
                  <div
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer relative ${
                      activeTab === tab ? "text-[#000]" : ""
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="w-full border-t-[2px] border-solid border-[#000] absolute top-[33px]" />
                    )}
                  </div>
                ))}
              </div>
              <div className="w-full border-t-[1px] border-solid border-[#c8c8c8] mt-5"></div>

              <div
                className={`mt-3 transition-opacity duration-500 ${
                  activeTab ? "opacity-100" : "opacity-0"
                }`}
              >
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Formik
          initialValues={{
            fullname: userData?.fullname || "",
            address: userData?.address || "",
            phone: userData?.phone || "",
            dob: userData?.dob
              ? userData.dob.split("/").reverse().join("-")
              : "",
            gender: userData?.gender || "",
            avatar: null,
            contactFacebook: userData?.contactFacebook || "",
            contactInstagram: userData?.contactInstagram || "",
            contactTelegram: userData?.contactTelegram || "",
            digitalSpotify: userData?.digitalSpotify || "",
            digitalAppleMusic: userData?.digitalAppleMusic || "",
            digitalTiktok: userData?.digitalTiktok || "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white md:w-[68%] w-[90%] p-6 rounded-[8px] shadow-lg relative max-h-[90%] overflow-y-auto">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  <IoIosClose size="28px" />
                </button>
                <h2 className="text-xl font-bold">Update Profile</h2>

                <Form className="">
                  {/* Avatar Preview */}
                  {/* Avatar Preview */}
                  <div className="flex flex-col items-center mb-4">
                    <input
                      name="avatar"
                      type="file"
                      accept="image/jpeg, image/png, image/jpg"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setFieldValue("avatar", file);
                        }
                      }}
                      className="hidden"
                      id="avatarUpload"
                    />

                    {/* Khung tròn với icon */}
                    <label
                      htmlFor="avatarUpload"
                      className="w-[100px] h-[100px] bg-[#f0f0f0] border border-[#d5d5d6] rounded-full flex justify-center items-center cursor-pointer hover:bg-[#e9e9e9] transition duration-200"
                    >
                      {/* Icon Upload */}
                      {!values.avatar && (
                        <div className="text-[#5e5b5b] flex flex-col justify-center items-center">
                          <MdOutlineFileUpload size="30px" />
                          <div className="text-xs mt-2">Upload Avatar</div>
                        </div>
                      )}

                      {/* Nếu đã có ảnh, hiển thị ảnh trong khung tròn */}
                      {values.avatar && (
                        <img
                          src={URL.createObjectURL(values.avatar)}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                      )}
                    </label>

                    {/* Hiển thị thông báo lỗi */}
                    <ErrorMessage
                      name="avatar"
                      component="div"
                      className="text-red-500 text-sm mt-2 text-center"
                    />
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {/* Fullname */}
                    <div>
                      <Field
                        name="fullname"
                        type="text"
                        placeholder="Fullname"
                        className="bg-[#eee] outline-none px-[16px] py-[10px] w-[300px] md:w-[300px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                      />
                      <ErrorMessage
                        name="fullname"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <Field
                        name="address"
                        type="text"
                        placeholder="Address (ward, district, city)"
                        className="bg-[#eee] outline-none px-[16px] py-[10px] w-[300px] md:w-[300px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                      />
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Field
                        name="phone"
                        type="text"
                        placeholder="Phone"
                        className="bg-[#eee] outline-none px-[16px] py-[10px] w-[300px] md:w-[300px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <Field
                        name="dob"
                        type="date"
                        className="bg-[#eee] outline-none px-[16px] py-[10px] w-[300px] md:w-[300px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                      />
                      <ErrorMessage
                        name="dob"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Gender */}
                    <div className="">
                      <div className="flex items-center gap-4 mt-3 ml-1">
                        <label className="text-[14px] text-gray-700">
                          Gender:
                        </label>
                        <label className="flex items-center gap-1">
                          <Field
                            type="radio"
                            name="gender"
                            value="male"
                            className="accent-black"
                          />
                          <span className="text-[14px] text-gray-700">
                            Male
                          </span>
                        </label>
                        <label className="flex items-center gap-1">
                          <Field
                            type="radio"
                            name="gender"
                            value="female"
                            className="accent-black"
                          />
                          <span className="text-[14px] text-gray-700">
                            Female
                          </span>
                        </label>
                        <label className="flex items-center gap-1">
                          <Field
                            type="radio"
                            name="gender"
                            value="other"
                            className="accent-black"
                          />
                          <span className="text-[14px] text-gray-700">
                            Other
                          </span>
                        </label>
                      </div>
                      <ErrorMessage
                        name="gender"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="text-[14px] font-bold mt-6 ">
                    Include personal contact information and links to the
                    digital music platforms you use (recommended)
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3 overflow-y-auto scrollbar-visible h-[50px] sm:h-[99px] pt-1 pb-2">
                    <Field
                      name="contactFacebook"
                      placeholder="Link facebook"
                      className="bg-[#eee] outline-none px-[16px] py-[10px] w-[300px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                    />
                    <Field
                      name="contactInstagram"
                      placeholder="Link Instagram"
                      className="bg-[#eee] outline-none px-[16px] py-[10px] w-[300px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                    />
                    <Field
                      name="contactTelegram"
                      placeholder="Link Telegram"
                      className="bg-[#eee] outline-none px-[16px] py-[10px] w-[300px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                    />
                    <Field
                      name="digitalSpotify"
                      placeholder="Spotify link"
                      className="bg-[#eee] outline-none px-[16px] py-[10px] w-[300px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                    />
                    <Field
                      name="digitalAppleMusic"
                      placeholder="Apple Music link"
                      className="bg-[#eee] outline-none px-[16px] py-[10px] w-[300px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                    />
                    <Field
                      name="digitalTiktok"
                      placeholder="Tiktok link"
                      className="bg-[#eee] outline-none px-[16px] py-[10px] w-[300px] rounded-[14px] text-[14px] placeholder:text-[#828181]"
                    />
                  </div>

                  <div className="flex gap-4 justify-end mt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="bg-gray-500 text-white px-4 py-2 rounded-[8px] hover:bg-gray-600"
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
                            Saving <span className="dot">.</span>
                            <span className="dot">.</span>
                            <span className="dot">.</span>
                          </span>
                        </>
                      ) : (
                        "Save"
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

export default Profile;
