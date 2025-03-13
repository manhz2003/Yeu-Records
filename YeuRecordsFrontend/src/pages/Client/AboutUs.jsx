import aboutUsBg from "../../assets/images/aboutUsBg.png";
import icons from "../../utils/icon";
const { FaFacebookF, FaTelegramPlane, FaInstagram } = icons;

const AboutUs = () => {
  return (
    <div className="w-screen">
      <div className="w-screen h-screen flex justify-center items-center relative">
        <div
          className="absolute z-20 md:block hidden"
          style={{
            width: "650px",
            height: "650px",
            backgroundImage: `url(${aboutUsBg})`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            left: "560px",
          }}
        ></div>

        <div
          className="absolute md:w-[68%] md:h-[400px] w-[90%] bg-[#fefefe] text-[#666666] flex z-10 md:mb-[98px] rounded-[4px] p-[50px]"
          style={{
            outline: "3px solid #f1f1f1",
            outlineOffset: "-15px",
          }}
        >
          <div className="flex flex-col gap-7 w-[560px] leading-6">
            <div className="text-[32px] text-[#222222] font-bod">
              WHO WE ARE
            </div>
            <div className="text-[16px] font-normal">
              Yeu Records is a music distribution company dedicated to helping
              independent artists bring their music to a global audience. We
              collaborate with talented musicians to collect their tracks and
              release them on popular streaming platforms such as Spotify, Apple
              Music, and YouTube. Our mission is to simplify the process of
              music distribution, enabling artists to focus on their creativity
              while we handle the business side.
            </div>
            <div className="text-[16px] font-normal">
              By partnering with us, artists can reach new listeners and earn
              revenue from their streams, with profits shared transparently. At
              Yeu Records, we believe in empowering artists and bringing their
              unique sounds to the world.
            </div>
          </div>
        </div>
      </div>
      <div className="text-[#222222] flex justify-center items-center flex-col md:mt-8 md:h-[480px] h-[800px] bg-[#fefefe]">
        <div className="font-bold text-[32px]">CONTACT US</div>
        <div className="flex justify-center items-center flex-wrap gap-8 mt-[65px]">
          <a
            href="https://www.facebook.com/WonJeongHae"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link flex flex-col gap-3 justify-center items-center w-[350px] p-6 leading-6 cursor-pointer group"
          >
            <div className="transition-all group-hover:text-[#0f217f]">
              <FaFacebookF size="38px" />
            </div>
            <div className="text-[22px] font-normal text-[#333333] mt-3">
              Contact Facebook
            </div>
            <div className="text-center text-[18px] font-light text-[#666666]">
              Connect with us on Facebook for updates, inquiries, and more.
            </div>
          </a>

          <a
            href="https://t.me/+84987739823"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link flex flex-col gap-3 justify-center items-center w-[350px] p-6 leading-6 cursor-pointer group"
          >
            <div className="transition-all group-hover:text-[#0f217f]">
              <FaTelegramPlane size="38px" />
            </div>
            <div className="text-[22px] font-normal text-[#333333] mt-3">
              Contact Telegram
            </div>
            <div className="text-center text-[18px] font-light text-[#666666]">
              Reach out to us on Telegram for quick and easy communication.
            </div>
          </a>

          <a
            href="https://www.instagram.com/wolfdev2003/"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link flex flex-col gap-3 justify-center items-center w-[350px] p-6 leading-6 cursor-pointer group"
          >
            <div className="transition-all group-hover:text-[#0f217f]">
              <FaInstagram size="38px" />
            </div>
            <div className="text-[22px] font-normal text-[#333333] mt-3">
              Contact Instagram
            </div>
            <div className="text-center text-[18px] font-light text-[#666666]">
              Follow us on Instagram for updates and more!
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
