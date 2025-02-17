import icons from "../../utils/icon";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
const {
  IoSearch,
  PiPlaylistDuotone,
  IoIosClose,
  GiPauseButton,
  FaPlay,
  FaPause,
  IoPlayBack,
  IoPlayForward,
  FaRandom,
  FaRedo,
  FaVolumeUp,
  FaVolumeMute,
  FaVolumeDown,
  IoMdPlay,
  RiShareForwardFill,
} = icons;

import {
  apiGetAllMusicByUserIdOrAlbumId,
  apiUpdateMusicAlbumId,
} from "../../apis/music";

const PlayMusic = React.memo(({ receivedDataAlbum, receivedDataAlbumId }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [listMusic, setListMusic] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [filteredMusic, setFilteredMusic] = useState(listMusic);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [musicId, setMusicId] = useState();
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fetchDataMusic = async () => {
    try {
      const dataUser = JSON.parse(localStorage.getItem("userInfo"));
      const response = await apiGetAllMusicByUserIdOrAlbumId(
        dataUser.userId,
        receivedDataAlbumId
      );
      if (response.status === 200) {
        setListMusic(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching music data:", error);
    }
  };

  console.log(listMusic);

  // chuyển từ fake data sang data thật
  useEffect(() => {
    if (!listMusic || listMusic.length === 0) {
      setCurrentSong(null);
      return;
    }

    const formattedSongs = listMusic.map((music) => ({
      title: music.musicName,
      artist: music.fullName,
      image: music.thumbnailUrl,
      src: music.musicUrl,
    }));

    if (formattedSongs && formattedSongs.length > 0) {
      setCurrentSong(formattedSongs[0]);
    }
  }, [listMusic]);

  // Effect để cập nhật độ dài bài hát khi bài hát thay đổi
  useEffect(() => {
    if (currentSong) {
      setDuration(audioRef.current.duration);
    }
  }, [currentSong]);

  // Hàm toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      // Lưu lại thời gian hiện tại khi tạm dừng
      setCurrentTime(audioRef.current.currentTime);
      audioRef.current.pause();
    } else {
      audioRef.current.currentTime = currentTime;
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    }
    setIsPlaying(!isPlaying);
  };

  // Hàm cập nhật thời gian phát nhạc
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  // Hàm seek bài hát theo input range
  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Hàm khi metadata của bài hát đã được tải
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  // Hàm định dạng thời gian (phút:giây)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // phát và dừng nhạc
  const handlePlayPause = (index) => {
    const selectedSong = filteredMusic[index];

    // Chỉ cập nhật src và bắt đầu phát khi cần thiết
    if (currentSong?.src !== selectedSong?.musicUrl) {
      setCurrentSong({
        title: selectedSong?.musicName,
        artist: selectedSong?.fullName,
        image: selectedSong?.thumbnailUrl,
        src: selectedSong?.musicUrl,
      });
      setActiveIndex(index);
      setIsPlaying(true);
    } else {
      // Chỉ thay đổi trạng thái phát nếu song đã được chọn
      setIsPlaying(!isPlaying);
    }

    // Phát nhạc ngay lập tức
    if (audioRef.current && currentSong?.src === selectedSong?.musicUrl) {
      if (!isPlaying) {
        audioRef.current
          .play()
          .catch((error) => console.error("Error playing audio:", error));
      } else {
        audioRef.current.pause();
      }
    }
  };

  // api update chuyển music vào album
  const fetchApiUpdateMusicAlbumId = async () => {
    try {
      const response = await apiUpdateMusicAlbumId(musicId, selectedAlbums);
      if (response.status === 200) {
        toast.success(
          `Add music ${response?.data.result?.musicName} to album ${response?.data.result?.albumName} success !`
        );
        fetchDataMusic();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirm = () => {
    if (selectedAlbums) {
      fetchApiUpdateMusicAlbumId();
    } else {
      toast.error("You haven't selected an album!");
    }
  };

  useEffect(() => {
    fetchDataMusic();
  }, [receivedDataAlbumId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Hàm xử lý thay đổi volume
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    setIsMuted(false);
  };

  // Hàm xử lý khi bài hát kết thúc
  const handleSongEnd = () => {
    if (shuffle && filteredMusic.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredMusic.length);
      handlePlayPause(randomIndex);
    } else if (repeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      handleNextSong();
    }
  };

  // Hàm chuyển bài tiếp theo
  const handleNextSong = () => {
    let nextIndex = activeIndex + 1;
    if (nextIndex >= filteredMusic.length) nextIndex = 0;
    handlePlayPause(nextIndex);
  };

  // Hàm chuyển bài trước đó
  const handlePreviousSong = () => {
    let prevIndex = activeIndex - 1;
    if (prevIndex < 0) prevIndex = filteredMusic.length - 1;
    handlePlayPause(prevIndex);
  };

  // Hàm toggle mute
  const handleMuteToggle = () => {
    if (isMuted) {
      // Nếu đã mute, khôi phục âm lượng trước đó
      setVolume(previousVolume);
    } else {
      // Nếu đang không mute, lưu âm lượng hiện tại và mute
      setPreviousVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  // search bài nhạc
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMusic(listMusic);
    } else {
      const results = listMusic.filter((music) =>
        music.musicName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMusic(results);
    }
  }, [searchTerm, listMusic]);

  // Effect để tự động phát nhạc khi bài hát thay đổi
  useEffect(() => {
    if (currentSong && audioRef.current.src !== currentSong.src) {
      audioRef.current.src = currentSong.src;
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((error) => console.error("Error playing audio:", error));
      }
    }
  }, [currentSong, isPlaying]);

  // Hàm toggle chế độ lặp lại
  const toggleRepeat = () => {
    setRepeat(!repeat);
  };

  useEffect(() => {
    if (repeat && audioRef.current) {
      audioRef.current.loop = true;
    } else if (audioRef.current) {
      audioRef.current.loop = false;
    }
  }, [repeat]);

  // Hàm toggle chế độ phát ngẫu nhiên
  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  // Xử lý icon âm lượng tùy theo trạng thái mute hoặc âm lượng
  let volumeIcon;
  if (isMuted || volume === 0) {
    volumeIcon = (
      <FaVolumeMute className="text-gray-500" onClick={handleMuteToggle} />
    );
  } else if (volume < 0.5) {
    volumeIcon = (
      <FaVolumeDown className="text-gray-500" onClick={handleMuteToggle} />
    );
  } else {
    volumeIcon = (
      <FaVolumeUp className="text-gray-500" onClick={handleMuteToggle} />
    );
  }

  // xử lý input search
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <>
      <div className="flex flex-col md:h-[330px] h-[360px]">
        <div className="">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <PiPlaylistDuotone size="18px" />
                </div>
                <div className="text-[15px] font-medium">playlist</div>
                {/* search input */}
                <div
                  className={`flex items-center relative transition-all duration-500 ease-in-out ${
                    isSearchOpen ? "w-[212px]" : "w-[40px]"
                  } sm:w-[240px]`}
                >
                  <div
                    className={`flex items-center justify-center absolute left-0 top-0 h-full p-2 rounded-[50%] cursor-pointer transition-all duration-300 ${
                      isSearchOpen ? "translate-x-[0px]" : "translate-x-[10px]"
                    } ${
                      isSearchOpen ? "" : "hover:bg-[#000] hover:text-[#fff]"
                    }`}
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <IoSearch size="18px" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search in Your list music"
                    className={`pl-8 p-2 rounded-md border border-[#ccc] focus:outline-none transition-all duration-500 ease-in-out ${
                      isSearchOpen ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                    style={{
                      fontWeight: "300",
                      fontSize: "14px",
                      pointerEvents: isSearchOpen ? "auto" : "none",
                    }}
                    onBlur={() => setIsSearchOpen(false)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    ref={inputRef}
                  />
                </div>
              </div>
            </div>

            {/* data list music */}
            <div
              className="flex flex-col gap-1 overflow-y-auto mt-4 shadow"
              style={{
                maxHeight: "230px",
                boxShadow:
                  filteredMusic?.length >= 4
                    ? "inset 0 -15px 10px -10px rgba(0, 0, 0, 0)"
                    : "none",
                paddingRight: "8px",
                overflowX: "hidden",
              }}
            >
              {filteredMusic?.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center text-[15px] hover:bg-[#e6e6e6] hover:text-[#000] gap-5 cursor-pointer w-[99.5%] rounded-[8px] p-2 transition-all duration-100 ease-in-out relative ${
                    activeIndex === index ? "bg-[#e6e6e6] text-[#000]" : ""
                  }`}
                  onClick={() => {
                    handlePlayPause(index);
                    setActiveIndex(activeIndex === index ? null : index);
                  }}
                  title={`Music: ${item.musicName}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative">
                    <img
                      src={item?.thumbnailUrl}
                      alt={item?.musicName}
                      className="w-[36px] h-[36px] object-cover rounded-[6px]"
                    />
                    {hoveredIndex === index && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-[6px]">
                        <IoMdPlay size="20px" color="#fff" />
                      </div>
                    )}
                    {activeIndex === index && isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-[6px]">
                        <GiPauseButton size="20px" color="#fff" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div
                      className="font-medium truncate md:max-w-[800px] max-w-[250px]"
                      title={item?.musicName}
                    >
                      {item?.musicName}
                    </div>
                  </div>

                  <div className="ml-[30px]">[{item?.statusMusic}]</div>

                  {hoveredIndex === index && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsModalOpen(true);
                        setMusicId(item?.id);
                      }}
                      className="absolute right-2 cursor-pointer"
                    >
                      <RiShareForwardFill size="18px" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-5 w-[400px] md:w-[600px] max-h-[80vh] overflow-y-auto relative">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                      Add music to your album
                    </h3>
                    <button onClick={() => setIsModalOpen(false)}>
                      <IoIosClose size="24px" />
                    </button>
                  </div>

                  {/* Album List */}
                  <div className="flex flex-col gap-3">
                    {receivedDataAlbum?.map((album, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="album"
                          value={album.id}
                          checked={selectedAlbums === album.id}
                          onChange={() => {
                            setSelectedAlbums(album.id);
                          }}
                          className="accent-black rounded-[50%]"
                        />
                        <span className="truncate">{album.name}</span>
                      </label>
                    ))}
                  </div>

                  {/* Confirm Button */}
                  <div className="mt-4 flex justify-end gap-5">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleConfirm();
                      }}
                      className="px-4 py-2 bg-[#000] text-white rounded-md"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="control music">
          <div className="w-full flex items-center justify-between h-[55px] mt-5">
            {/* Left: Song Info */}
            <div className="items-center gap-4 hidden md:flex w-[100px]">
              <img
                src={currentSong?.image || "https://via.placeholder.com/150"}
                alt="Song Thumbnail"
                className="w-[45px] h-[45px] rounded-[8px]"
              />
              <div>
                <h4
                  className="text-[14px] font-semibold leading-5 truncate cursor-default"
                  title={currentSong?.title}
                >
                  {currentSong?.title?.length > 12
                    ? `${currentSong?.title.substring(0, 12)}...`
                    : currentSong?.title}
                </h4>
                <p
                  className="text-[12px] text-gray-500 leading-5 truncate cursor-default"
                  title={currentSong?.artist}
                >
                  {currentSong?.artist?.length > 12
                    ? `${currentSong?.artist?.substring(0, 12)}...`
                    : currentSong?.artist}
                </p>
              </div>
            </div>

            {/* Center: Controls */}
            <div className="flex flex-col items-center w-full max-w-lg">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={toggleShuffle}
                  className={`text-[14px] ${
                    shuffle ? "text-black" : "text-[#707070]"
                  } hover:text-[#000]`}
                >
                  <FaRandom />
                </button>

                <button
                  onClick={handlePreviousSong}
                  className="text-[14px] text-[#707070] hover:text-[#000]"
                >
                  <IoPlayBack />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="text-[14px] text-[#707070] hover:text-[#000]"
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button
                  onClick={handleNextSong}
                  className="text-[14px] text-[#707070] hover:text-[#000]"
                >
                  <IoPlayForward />
                </button>
                <button
                  onClick={toggleRepeat}
                  className={`text-[14px] ${
                    repeat ? "text-black" : "text-[#707070]"
                  } hover:text-[#000]`}
                >
                  <FaRedo />
                </button>
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="text-[14px]">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(currentTime / duration) * 100 || 0}
                  onChange={handleSeek}
                  className="w-full accent-[#707070] h-[5px] rounded-[8px]"
                />
                <span className="text-[14px]">{formatTime(duration)}</span>
                {/* Audio Element */}
                <audio
                  ref={audioRef}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleSongEnd}
                />
              </div>
            </div>

            {/* Right: Volume Control */}
            <div className="items-center gap-2 hidden md:flex">
              {volumeIcon}
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={handleVolumeChange}
                className="w-24 bg-gray-200 accent-[#707070] h-[5px] rounded-[8px] custom-range"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default PlayMusic;
