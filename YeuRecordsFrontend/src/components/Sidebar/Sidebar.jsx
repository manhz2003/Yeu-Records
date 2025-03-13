import logo from "../../assets/images/logoEDM.png";
import { Link, NavLink, useLocation } from "react-router-dom";
import path from "../../utils/path";
import icons from "../../utils/icon";
import { useState, useEffect, useRef } from "react";

const paths = {
  HomePage: path.HOME,
  Dashboard: path.DASHBOARD,
  ManageArtists: path.MANAGE_ARTISTS,
  ManageMusic: path.MANAGE_MUSIC,
  ManageLicenses: path.MANAGE_LICENSES,
  ManageCategories: path.MANAGE_CATEGORIES,
  ManageSignature: path.MANAGE_SIGNATURE,
};

const {
  RiDashboardHorizontalFill,
  FaUserCog,
  BiSolidCategoryAlt,
  RiFolderMusicFill,
  TbLicense,
  RxHamburgerMenu,
  FaFileSignature,
} = icons;

const Sidebar = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const menuItems = [
    {
      name: "Dashboard",
      path: paths.Dashboard,
      icon: <RiDashboardHorizontalFill />,
    },
    { name: "Artist", path: paths.ManageArtists, icon: <FaUserCog /> },
    {
      name: "Categories",
      path: paths.ManageCategories,
      icon: <BiSolidCategoryAlt />,
    },
    { name: "Music", path: paths.ManageMusic, icon: <RiFolderMusicFill /> },
    { name: "License", path: paths.ManageLicenses, icon: <TbLicense /> },
    {
      name: "Signature",
      path: paths.ManageSignature,
      icon: <FaFileSignature />,
    },
  ];

  // Close sidebar if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSidebarToggle = (event) => {
    event.stopPropagation();
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      {/* Hamburger Icon for mobile */}
      <div
        className="lg:hidden absolute top-4 left-4 cursor-pointer"
        onClick={handleSidebarToggle}
      >
        <RxHamburgerMenu size="23px" />
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`h-screen w-[230px] bg-[#fff] shadow-sm p-4 flex flex-col transform transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <Link
          to={paths.HomePage}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div>
            <img
              className="w-[60px] h-[60px] rounded-[50%]"
              src={logo}
              alt="logo"
            />
          </div>
          <div className="font-medium text-[22px]">
            <div>Yeu</div>
            <div>Records</div>
          </div>
        </Link>

        {/* Menu */}
        <div className="mt-7">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => {
                const isCurrentPath = location.pathname.includes(item.path);
                return `flex items-center gap-3 py-2 my-2 rounded-md cursor-pointer text-[16px] font-normal ${
                  isCurrentPath
                    ? "text-black font-medium"
                    : "text-gray-600 hover:text-[#000] font-thin"
                }`;
              }}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
