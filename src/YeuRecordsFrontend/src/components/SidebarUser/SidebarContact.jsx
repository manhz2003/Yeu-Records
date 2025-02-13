const SidebarContact = ({ userData }) => {
  const digitalPlatforms = [
    { name: "Spotify", link: userData.digitalSpotify },
    { name: "Apple Music", link: userData.digitalAppleMusic },
    { name: "TikTok Music", link: userData.digitalTiktok },
  ];

  return (
    <div className="h-full w-full md:w-[31%] bg-[#fefefe] rounded-[8px] shadow-sm p-5 flex flex-col gap-7">
      {/* Contact Section */}
      <div className="flex flex-col">
        <div className="flex items-center gap-4">
          <div className="text-[#686767] text-[10px] font-bold">CONTACT</div>
          <div className="w-full border-t-[1px] border-solid border-[#9a9a9a] mt-2" />
        </div>

        {/* Facebook */}
        {userData.contactFacebook && (
          <div>
            <div className="flex justify-between mt-3">
              <div className="flex items-center justify-center text-[14px] font-bold text-[#000] py-2">
                Contact social network
              </div>
              <div className="flex items-center justify-center text-[11px] font-bold text-[#0099CC] bg-[#E6F2FF] p-2 rounded-[6px] mr-7 w-[80px]">
                Facebook
              </div>
            </div>
            <a
              href={userData.contactFacebook}
              className="text-[12px] text-[#686767] font-normal mt-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {userData.contactFacebook}
            </a>
          </div>
        )}

        {/* Instagram */}
        {userData.contactInstagram && (
          <div>
            <div className="flex justify-between mt-3">
              <div className="flex items-center justify-center text-[14px] font-bold text-[#000] py-2">
                Contact social network
              </div>
              <div className="flex items-center justify-center text-[11px] font-bold text-[#0099CC] bg-[#E6F2FF] p-2 rounded-[6px] mr-7 w-[80px]">
                Instagram
              </div>
            </div>
            <a
              href={userData.contactInstagram}
              className="text-[12px] text-[#686767] font-normal mt-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {userData.contactInstagram}
            </a>
          </div>
        )}

        {/* Telegram */}
        {userData.contactTelegram && (
          <div>
            <div className="flex justify-between mt-3">
              <div className="flex items-center justify-center text-[14px] font-bold text-[#000] py-2">
                Contact social network
              </div>
              <div className="flex items-center justify-center text-[11px] font-bold text-[#0099CC] bg-[#E6F2FF] p-2 rounded-[6px] mr-7 w-[80px]">
                Telegram
              </div>
            </div>
            <a
              href={`https://t.me/+${userData.contactTelegram}`}
              className="text-[12px] text-[#686767] font-normal mt-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {userData.contactTelegram}
            </a>
          </div>
        )}

        {/* Nếu không có thông tin liên hệ */}
        {!userData.contactFacebook &&
          !userData.contactInstagram &&
          !userData.contactTelegram && (
            <div className="text-[#686767] text-[12px] font-normal mt-2">
              Click the update profile button to add your personal information.
            </div>
          )}
      </div>

      {/* Digital Music Platform Section */}
      <div>
        <div className="flex items-center gap-4">
          <div className="text-[#686767] text-[10px] font-bold">
            DIGITAL MUSIC PLATFORM LINK
          </div>
          <div className="md:w-[56%] w-[55%] border-t-[1px] border-solid border-[#9a9a9a] mt-2" />
        </div>
        <div
          className="text-[12px] font-medium leading-5 mt-4 flex gap-3 flex-wrap overflow-y-auto scrollbar-visible"
          style={{
            maxHeight:
              digitalPlatforms.filter((item) => item.link).length >= 4
                ? "130px"
                : "auto",
            boxShadow:
              digitalPlatforms.filter((item) => item.link).length >= 4
                ? "inset 0 -5px 5px -5px rgba(0, 0, 0, 0)"
                : "none",
          }}
        >
          {digitalPlatforms.map(
            (platform, index) =>
              platform.link && (
                <div
                  key={index}
                  className="truncate w-[380px] cursor-pointer text-[#333]"
                  title={platform.link}
                >
                  <a
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {platform.name}: {platform.link}
                  </a>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarContact;
