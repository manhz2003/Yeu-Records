import React from "react";
import icons from "../../utils/icon";
const { FaFacebookF, FaGoogle, FaInstagram } = icons;
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="h-auto flex flex-col items-center justify-between p-6 md:flex-row md:p-[84px] bg-[#000]">
      <div className="flex flex-col text-[#fff] text-[26px] md:text-[48px] font-bold gap-3 text-center md:text-left">
        <div>Create, Explore & sell</div>
        <div>your music</div>
      </div>
      <div className="flex flex-col gap-7 justify-end w-full md:w-auto">
        <div className="flex justify-center flex-wrap md:flex-row gap-4 md:gap-8 items-center text-[#989898] text-[14px] md:mt-0 mt-8 md:text-[16px]">
          <div className="cursor-pointer hover:text-[#fff] transition-all duration-300 ease-in-out">
            Privacy Policy
          </div>
          <div className="cursor-pointer hover:text-[#fff] transition-all duration-300 ease-in-out">
            Cooperation
          </div>
          <div className="cursor-pointer hover:text-[#fff] transition-all duration-300 ease-in-out">
            Sponsorship
          </div>
          <div className="cursor-pointer hover:text-[#fff] transition-all duration-300 ease-in-out">
            Contact Us
          </div>
        </div>
        <div className="flex gap-2 justify-center md:justify-end">
          <Link
            to={"https://www.facebook.com/thekongi"}
            className="bg-[#fff] custom-border group inline-flex justify-center items-center mx-1 w-7 h-7 rounded-[50%] cursor-pointer"
          >
            <FaFacebookF
              className="text-gray-800 group-hover:text-[#512da8]"
              size="17px"
            />
          </Link>
          <Link
            to={"https://www.google.com/"}
            className="bg-[#fff] custom-border group inline-flex justify-center items-center mx-1 w-7 h-7 rounded-[50%] cursor-pointer"
          >
            <FaGoogle
              className="text-gray-800 group-hover:text-[#512da8]"
              size="17px"
            />
          </Link>
          <Link
            to={"https://www.instagram.com/"}
            className="bg-[#fff] custom-border group inline-flex justify-center items-center mx-1 w-7 h-7 rounded-[50%] cursor-pointer"
          >
            <FaInstagram
              className="text-gray-800 group-hover:text-[#512da8]"
              size="17px"
            />
          </Link>
        </div>
        <div className="flex text-[#777] justify-center md:justify-end text-[12px] md:text-[14px]">
          Copyright © 2024 Yeu Records, All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;
