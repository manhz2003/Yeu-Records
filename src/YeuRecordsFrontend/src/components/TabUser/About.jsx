const About = ({ userData }) => {
  return (
    <>
      <div className="">
        <div className="flex items-center text-[12px] font-bold text-[#585757] mt-3">
          BASIC INFOMATION
        </div>

        <div className="flex items-center text-[14px] font-bold text-[#000] py-1 mt-2">
          Phone:
        </div>

        <div className="flex items-center text-[14px] font-normal text-[#000] py-1">
          {userData.phone}
        </div>

        <div className="flex items-center text-[14px] font-bold text-[#000] py-1">
          Address:
        </div>

        <div className="flex items-center text-[14px] font-normal text-[#000] py-1">
          {userData.address}
        </div>

        <div className="flex items-center text-[14px] font-bold text-[#000] py-1">
          E-mail:
        </div>

        <div className="flex items-center text-[14px] font-normal text-[#000] py-1">
          <a href="mailto:manhthenguyen2003@gmail.com">{userData.email}</a>
        </div>

        <div className="flex items-center text-[#000] py-2">
          <div className="flex items-center text-[14px] font-bold text-[#000]">
            Birthday:
          </div>
          <div className="text-[12px] font-normal ml-[90px]">
            {userData.dob}
          </div>
        </div>

        <div className="flex items-center text-[#000] py-1 ">
          <div className="flex items-center text-[14px] font-bold text-[#000]">
            Gender:
          </div>
          <div className="text-[12px] font-normal ml-[98px]">
            {userData.gender}
          </div>
        </div>

        <div className="flex items-center text-[14px] font-bold text-[#000] py-1 mt-3">
          Site:
        </div>

        <div className="flex items-center text-[14px] font-normal text-[#000] py-1">
          www.yeurecord.com
        </div>
      </div>
    </>
  );
};

export default About;
