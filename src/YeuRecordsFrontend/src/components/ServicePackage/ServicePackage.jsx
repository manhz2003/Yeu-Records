import React from "react";
import icons from "../../utils/icon";
import item1 from "../../assets/images/item-1.png";
import item2 from "../../assets/images/item-2.png";
import item3 from "../../assets/images/item-3.png";
import item4 from "../../assets/images/item-4.png";

const { FaDollarSign } = icons;

const ServicePackage = () => {
  return (
    <div className="flex flex-col gap-9">
      <div className="text-[30px] md:text-[36px] font-bold">
        Hot service package
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="bg-[#dfdcdd] px-4 py-2 rounded-[14px] text-[16px] cursor-default hover:bg-[#0f2182] hover:text-[#fff] transition-all duration-300 ease-in-out">
          Yeu Records
        </div>
        <div className="bg-[#dfdcdd] px-4 py-2 rounded-[14px] text-[16px] cursor-default hover:bg-[#0f2182] hover:text-[#fff] transition-all duration-300 ease-in-out">
          Abstract
        </div>
        <div className="bg-[#dfdcdd] px-4 py-2 rounded-[14px] text-[16px] cursor-default hover:bg-[#0f2182] hover:text-[#fff] transition-all duration-300 ease-in-out">
          License
        </div>
        <div className="bg-[#dfdcdd] px-4 py-2 rounded-[14px] text-[16px] cursor-default hover:bg-[#0f2182] hover:text-[#fff] transition-all duration-300 ease-in-out">
          Trending
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 md:justify-start justify-center">
        <div className="flex flex-col gap-4 h-[422px] w-[302px] bg-[#fff] p-[20px] rounded-[18px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-none">
          <div className="rounded-[18px]">
            <img className=" rounded-[18px]" src={item1} alt="" />
          </div>
          <div className=" font-bold text-[18px]">CryptoArt</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className=" rounded-[50%] bg-[#304ffe] p-1">
                <FaDollarSign size="12px" color="#fff" />
              </div>
              <div className="text-[12px] text-[#304ffe] font-normal">
                0.29 DOLLAR
              </div>
            </div>
            <div className="text-[#989898] text-[12px] font-normal ">
              5 of 33
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[#000] text-[13px] font-normal bg-[#ececec] px-3 py-2 rounded-[10px]">
              2h 28m 1s
            </div>
            <div className="text-[13px] font-bold text-[#304ffe] hover:bg-[#000] hover:text-[#fff] transition-all duration-300 ease-in-out px-3 py-2 rounded-[10px] cursor-pointer">
              Place a Bid
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 h-[422px] w-[302px] bg-[#fff] p-[20px] rounded-[18px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-none">
          <div className="rounded-[18px]">
            <img className=" rounded-[18px]" src={item2} alt="" />
          </div>
          <div className=" font-bold text-[18px]">Abs-Art</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className=" rounded-[50%] bg-[#304ffe] p-1">
                <FaDollarSign size="12px" color="#fff" />
              </div>
              <div className="text-[12px] text-[#304ffe] font-normal">
                0.21 DOLLAR
              </div>
            </div>
            <div className="text-[#989898] text-[12px] font-normal ">
              7 of 12
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[#000] text-[13px] font-normal bg-[#ececec] px-3 py-2 rounded-[10px]">
              1h 28m 1s
            </div>
            <div className="text-[13px] font-bold text-[#304ffe] hover:bg-[#000] hover:text-[#fff] transition-all duration-300 ease-in-out px-3 py-2 rounded-[10px] cursor-pointer">
              Place a Bid
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 h-[422px] w-[302px] bg-[#fff] p-[20px] rounded-[18px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-none">
          <div className="rounded-[18px]">
            <img className=" rounded-[18px]" src={item3} alt="" />
          </div>
          <div className=" font-bold text-[18px]">TestArt</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className=" rounded-[50%] bg-[#304ffe] p-1">
                <FaDollarSign size="12px" color="#fff" />
              </div>
              <div className="text-[12px] text-[#304ffe] font-normal">
                0.21 DOLLAR
              </div>
            </div>
            <div className="text-[#989898] text-[12px] font-normal ">
              9 of 23
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[#000] text-[13px] font-normal bg-[#ececec] px-3 py-2 rounded-[10px]">
              4h 21m 1s
            </div>
            <div className="text-[13px] font-bold text-[#304ffe] hover:bg-[#000] hover:text-[#fff] transition-all duration-300 ease-in-out px-3 py-2 rounded-[10px] cursor-pointer">
              Place a Bid
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 h-[422px] w-[302px] bg-[#fff] p-[20px] rounded-[18px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-none">
          <div className="rounded-[18px]">
            <img className=" rounded-[18px]" src={item4} alt="" />
          </div>
          <div className=" font-bold text-[18px]">Art-4</div>
          <div className="flex items-center justify-between border-b border-[#edecec]">
            <div className="flex items-center gap-2">
              <div className=" rounded-[50%] bg-[#304ffe] p-1">
                <FaDollarSign size="12px" color="#fff" />
              </div>
              <div className="text-[12px] text-[#304ffe] font-normal">
                0.45 DOLLAR
              </div>
            </div>
            <div className="text-[#989898] text-[12px] font-normal ">
              1 of 33
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[#000] text-[13px] font-normal bg-[#ececec] px-3 py-2 rounded-[10px]">
              0h 28m 1s
            </div>
            <div className="text-[13px] font-bold text-[#304ffe] hover:bg-[#000] hover:text-[#fff] transition-all duration-300 ease-in-out px-3 py-2 rounded-[10px] cursor-pointer">
              Place a Bid
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePackage;
