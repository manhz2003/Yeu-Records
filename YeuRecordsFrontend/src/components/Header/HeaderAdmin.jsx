import React, { useState, useRef, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import path from "../../utils/path";
import icons from "../../utils/icon";
import avatarAdmin from "../../assets/images/avatar-admin.jpg";
import jwt_decode from "jwt-decode";
import { apiLogout } from "../../apis/auth";

const paths = {
  Login: path.LOGIN,
  Register: path.REGISTER,
  Home: path.HOME,
  SubmitMusic: path.SUBMIT_MUSIC,
  Artist: path.ARTIST,
  ChangePassWord: path.CHANGE_PASSWORD,
  Profile: path.PROFILE,
  AboutUs: path.ABOUT_US,
  Admin: path.ADMIN,
};

const { MdArrowDropDown } = icons;

const HeaderAdmin = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const menuRef = useRef(null);
  const avatarRef = useRef(null);
  const token = localStorage.getItem("accessToken");
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  let isAdmin = false;
  if (token) {
    const decodedToken = jwt_decode(token);
    const userRoles = decodedToken.roles || [];

    // Kiểm tra nếu userRoles chứa "ADMIN" hoặc "STAFF"
    isAdmin = userRoles.some(
      (role) => role.name === "ADMIN" || role.name === "STAFF"
    );
  }

  const avatarSrc = userInfo.avatar || avatarAdmin;

  const onLogoutClick = async () => {
    try {
      const response = await apiLogout({
        email: userInfo.email,
        token: token,
      });

      if (response.status === 204) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userInfo");
        setIsLoggedOut(true);
        setIsMenuOpen(false);
      }
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      setIsLoggedOut(true);
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Chuyển hướng khi đã đăng xuất
  if (isLoggedOut) {
    return <Navigate to={paths.Login} replace />;
  }

  return (
    <>
      <div className="bg-[#fff] h-[60px] flex items-center justify-end md:px-[45px] px-[20px] border-b border-solid border-[#dddfe1]">
        <div className="md:w-[83.5%] flex items-center justify-between">
          {/* Ẩn phần text trên màn hình nhỏ và hiển thị lại trên màn hình lớn */}
          <div className="md:flex flex-col gap-2 hidden">
            <div className="font-bold text-[15px]">
              PHẦN MỀM QUẢN LÝ NHẠC VÀ NGHỆ SĨ YEU RECORD
            </div>

            <div className="font-thin text-[15px]">
              MUSIC AND ARTIST MANAGEMENT SOFTWARE
            </div>
          </div>

          <div
            className="relative flex items-center justify-center gap-3 cursor-pointer select-none"
            ref={avatarRef}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="w-[42px] h-[42px] bg-white rounded-[50%] flex justify-center items-center">
              <img
                className="w-[40px] h-[40px] rounded-[50%] pointer-events-none"
                src={avatarSrc}
                alt="avatar"
              />
            </div>

            <div className="flex gap-3 items-center justify-center text-[14px] font-normal select-none">
              <div>Admin Account</div>
              <MdArrowDropDown size="23px" />
            </div>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute top-[60px] right-0 flex flex-col p-3 gap-4 text-[14px] text-[#000] bg-[#f7f4f4] w-[180px] rounded-[6px] shadow-lg select-none"
                style={{ zIndex: 1000 }}
              >
                {isAdmin && (
                  <Link className="cursor-pointer" to={paths.Home}>
                    Home
                  </Link>
                )}
                <Link className="cursor-pointer" to={paths.ChangePassWord}>
                  Change password
                </Link>
                <div className="cursor-pointer" onClick={onLogoutClick}>
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderAdmin;
