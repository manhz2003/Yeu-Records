import React from "react";
import icons from "../../utils/icon";
const { CiCirclePlus, FaFileSignature, CiViewList } = icons;

const Feature = () => {
  return (
    <div className="">
      <div className="text-[30px] md:text-[36px] py-[20px] font-bold">
        Popular features for you
      </div>
      <div className="flex flex-wrap gap-8 mt-[35px]">
        <div className="bg-[#fff] w-[404px] p-[20px] rounded-[18px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-none">
          <div className="flex items-center gap-3">
            <div className="">
              <CiCirclePlus size="43px" />
            </div>
            <div className="text-[17px] font-bold">Submit Music</div>
          </div>
          <div className=" text-[15px] mt-[14px] leading-5">
            The submit feature helps you send your work to distributors. You
            need to provide accurate information as required by the distributor.
          </div>
        </div>

        <div className="bg-[#fff] w-[404px] p-[20px] rounded-[18px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-none">
          <div className="flex items-center gap-3">
            <div className="">
              <FaFileSignature size="43px" />
            </div>
            <div className="text-[17px] font-bold">License signature</div>
          </div>
          <div className=" text-[15px] mt-[14px] leading-5">
            You will need to use your signature to agree to the publisher's
            terms, then the license will be exported to a pdf file.
          </div>
        </div>

        <div className="bg-[#fff] w-[404px] p-[20px] rounded-[18px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-none">
          <div className="flex items-center gap-3">
            <div className="">
              <CiViewList size="43px" />
            </div>
            <div className="text-[17px] font-bold">Artist list</div>
          </div>
          <div className=" text-[15px] mt-[14px] leading-5">
            Artists working with the company's publisher yeu records will be
            displayed as a list, you can observe them
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feature;
