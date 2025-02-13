import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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

const { RxHamburgerMenu } = icons;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const avatarRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const onLogoutClick = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = localStorage.getItem("accessToken");

      const response = await apiLogout({
        email: userInfo.email,
        token: token,
      });

      if (response.status === 204) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userInfo");
        setIsMenuOpen(false);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userInfo");
        setIsMenuOpen(false);
      }
      if (error.response?.status === 404) {
        console.log("Không tìm thấy email");
      }
      console.error(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }

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

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const token = localStorage.getItem("accessToken");
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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const getLinkClass = (path) => {
    if (location.pathname === paths.Home && path === paths.Home) {
      return "text-[#000]";
    }
    return location.pathname === path ? "text-[#102183]" : "text-[#000]";
  };

  return (
    <header className="bg-[#f1f1f1] relative select-none">
      <div className="flex items-center h-[80px] justify-between px-[20px] md:px-[40px] lg:px-[80px]">
        <div className="md:hidden">
          <button
            ref={hamburgerRef}
            onClick={handleMobileMenuToggle}
            className="text-[#000] focus:outline-none"
          >
            <RxHamburgerMenu />
          </button>
        </div>

        <Link
          to={paths.Home}
          className="text-[#0f2182] font-bold text-[21px] md:text-[32px] md:mr-0 mr-[130px] select-none"
        >
          Yeu Records
        </Link>

        <div className="hidden md:flex justify-center items-center gap-6 text-[14px] md:text-[16px] select-none">
          <NavLink
            to={paths.Home}
            className={({ isActive }) =>
              isActive ? "text-[#000]" : "text-[#000]"
            }
          >
            Home
          </NavLink>
          <NavLink
            to={paths.SubmitMusic}
            className={({ isActive }) =>
              isActive ? "text-[#0f217f]" : "text-[#000]"
            }
          >
            Submit Music
          </NavLink>
          <NavLink
            to={paths.Profile}
            className={({ isActive }) =>
              isActive ? "text-[#0f217f]" : "text-[#000]"
            }
          >
            Album
          </NavLink>
          <NavLink
            to={paths.AboutUs}
            className={({ isActive }) =>
              isActive ? "text-[#0f217f]" : "text-[#000]"
            }
          >
            About us
          </NavLink>
        </div>

        {token ? (
          <div className="relative">
            <div
              ref={avatarRef}
              className="w-[42px] h-[42px] bg-white rounded-[50%] cursor-pointer flex justify-center items-center"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <img
                className="w-[40px] h-[40px] rounded-[50%]"
                src={avatarSrc}
                alt="avatar"
              />
            </div>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute top-[60px] right-0 flex flex-col p-3 gap-4 text-[14px] text-[#000] bg-[#f7f4f4] w-[180px] rounded-[6px] shadow-lg"
                style={{ zIndex: 1000 }}
              >
                {isAdmin && (
                  <Link className="cursor-pointer" to={paths.Admin}>
                    Admin
                  </Link>
                )}
                <Link className="cursor-pointer" to={paths.Profile}>
                  Personal
                </Link>
                <Link className="cursor-pointer" to={paths.ChangePassWord}>
                  Change password
                </Link>
                <div className="cursor-pointer" onClick={onLogoutClick}>
                  Logout
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <Link to={paths.Login}>
              <button className="bg-[#000] rounded-[4px] text-[#fff] md:px-[12px] md:py-[8px] px-[10px] py-[6px] text-[14px]">
                Get Started
              </button>
            </Link>
            <Link to={paths.Register}>
              <button className="text-[14px]">Register</button>
            </Link>
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-[75px] left-[16px] flex flex-col p-3 gap-4 text-[14px] text-[#000] bg-[#f7f4f4] w-[180px] rounded-[6px] shadow-lg"
          style={{ zIndex: 1000 }}
        >
          <Link
            to={paths.Home}
            onClick={() => setIsMobileMenuOpen(false)}
            className={getLinkClass(paths.Home)}
          >
            Home
          </Link>
          <Link
            to={paths.SubmitMusic}
            onClick={() => setIsMobileMenuOpen(false)}
            className={getLinkClass(paths.SubmitMusic)}
          >
            Submit Music
          </Link>
          <Link
            to={paths.Artist}
            onClick={() => setIsMobileMenuOpen(false)}
            className={getLinkClass(paths.Artist)}
          >
            Artist
          </Link>
          <Link
            to={paths.Login}
            onClick={() => setIsMobileMenuOpen(false)}
            className={getLinkClass(paths.Login)}
          >
            About Us
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
