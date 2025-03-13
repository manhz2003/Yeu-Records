import React, { useEffect, useState } from "react";
import { apiGetListFeaturedArtist } from "../../apis";
import Skeleton from "react-loading-skeleton";

const HostArtist = () => {
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API để lấy danh sách featured artists
    const fetchFeaturedArtists = async () => {
      try {
        const response = await apiGetListFeaturedArtist(4);
        if (response && response.data && response.data.result) {
          setFeaturedArtists(response.data.result);
        }
      } catch (error) {
        console.error("Error fetching featured artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArtists();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col mb-[80px] w-full gap-12">
        <div className="text-left text-[30px] md:text-[36px] p-[20px] font-bold">
          Featured Artist
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-lg text-gray-500">Dữ liệu đang cập nhật...</div>
          <div className="flex flex-wrap gap-7 md:justify-start justify-center">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-[#fff] p-4 h-[95px] flex items-center md:justify-start justify-center w-[152px] md:w-[298px] gap-4 rounded-[18px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-none"
              >
                <div className="hidden md:block">
                  <Skeleton circle={true} height={64} width={64} />
                </div>
                <div className="flex flex-col items-center md:items-start justify-center gap-3">
                  <Skeleton width={100} height={15} />
                  <div className="flex gap-1 justify-center items-center">
                    <Skeleton width={40} height={15} />
                    <Skeleton width={30} height={15} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-[80px] w-full gap-12">
      <div className="text-left text-[30px] md:text-[36px] p-[20px] font-bold">
        Featured Artist
      </div>

      <div className="flex flex-wrap gap-7 md:justify-start justify-center">
        {featuredArtists.map((artist, index) => (
          <div
            key={index}
            className="bg-[#fff] p-4 h-[95px] flex items-center md:justify-start justify-center w-[152px] md:w-[298px] gap-4 rounded-[18px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-none"
          >
            <div className="hidden md:block rounded-[2px]">
              <img
                className="w-[64px] h-[64px] rounded-[2px]"
                src={artist.avatar || ""}
                alt={artist.nameArtist}
              />
            </div>
            <div className="flex flex-col items-center md:items-start justify-center gap-3">
              <div>{artist.nameArtist}</div>
              <div className="flex gap-1 justify-center items-center">
                <div>Issuance</div>
                <div>{artist.isuance}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostArtist;
