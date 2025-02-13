import React from "react";
import { Feature, HostArtist, ServicePackage } from "../../components";
import { Banner } from "../../components/index";

const HomePage = () => {
  return (
    <>
      <div>
        <Banner />
      </div>

      <div className="px-[20px] md:px-[40px] lg:px-[80px] flex flex-col gap-10">
        <div>
          <Feature />
        </div>

        <div className="mt-[23px]">
          <ServicePackage />
        </div>

        <div className="">
          <HostArtist />
        </div>
      </div>
    </>
  );
};

export default HomePage;
