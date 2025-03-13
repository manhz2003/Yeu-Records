import bannerLogo from "../../assets/images/Header.png";
import { Link } from "react-router-dom";
import icons from "../../utils/icon";
import path from "../../utils/path";
const { IoMusicalNotes } = icons;

const paths = {
  SubmitMusic: path.SUBMIT_MUSIC,
};

const Banner = () => {
  return (
    <>
      <div className="flex md:px-[40px] px-[20px] lg:px-[80px] my-[20px]">
        <div className="flex items-center">
          <div className="flex flex-col gap-8">
            <div className="text-[26px] md:text-[70px] font-bold flex flex-col gap-3">
              <div className="text-[#000]">Welcome to us</div>
              <div className="text-[#0f2182]">Yeu Records</div>
            </div>

            <div className="text-[#777] leading-5">
              It is very important that customers pay attention to the
              absorption process. And so, these things. Are we really working
              hard?
            </div>
            <Link to={paths.SubmitMusic}>
              <div className="bg-[#000] text-[#fff] w-[200px] h-[54px] md:w-[220px] md:h-[60px] pl-2 rounded-[40px] flex items-center gap-3">
                <div className="w-[44px] h-[44px] md:h-[48px] md:w-[48px] bg-white rounded-[100%] flex items-center justify-center">
                  <IoMusicalNotes color="#000" size="20px" />
                </div>
                <div className="">Submit Music</div>
              </div>
            </Link>
          </div>
        </div>
        <div>
          <img className="w-[780px]" src={bannerLogo} alt="Header" />
        </div>
      </div>
    </>
  );
};

export default Banner;
