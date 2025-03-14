package org.manhdev.yeurecords.service;

import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.yeurecords.constant.MessageConstant;
import org.manhdev.yeurecords.dto.request.MusicRequest;
import org.manhdev.yeurecords.dto.request.UpdateMusicStatusRequest;
import org.manhdev.yeurecords.dto.request.UpdatePlatformRequest;
import org.manhdev.yeurecords.dto.request.UpdateUpcIsrcRequest;
import org.manhdev.yeurecords.dto.response.MusicResponse;
import org.manhdev.yeurecords.dto.response.StatisticsMusicResponse;
import org.manhdev.yeurecords.dto.response.StatusMusicCountResponse;
import org.manhdev.yeurecords.exception.ResourceNotFoundException;
import org.manhdev.yeurecords.mapper.MusicMapper;
import org.manhdev.yeurecords.model.*;
import org.manhdev.yeurecords.repository.*;
import org.manhdev.yeurecords.util.UserAccessUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.*;

import static org.manhdev.yeurecords.util.HandleStringCloudinary.getPublicIdFromUrl;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MusicService {
    MusicRepository musicRepository;
    UserRepository userRepository;
    CategoryRepository categoryRepository;
    AlbumRepository albumRepository;
    MusicMapper musicMapper;
    CloudinaryService cloudinaryService;
    StatusMusicRepository statusMusicRepository;
    EmailService emailService;

    //    create music
    public MusicResponse createMusic(MusicRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.CATEGORY_NOT_FOUND));

        Album album = null;
        if (request.getAlbumId() != null && StringUtils.hasText(request.getAlbumId())) {
            album = albumRepository.findById(request.getAlbumId())
                    .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.ALBUM_NOT_FOUND));
        }

        Optional<StatusMusic> defaultStatusOpt = statusMusicRepository.findByNameStatus(MessageConstant.DEFAULT_STATUS);
        if (defaultStatusOpt.isEmpty()) {
            throw new ResourceNotFoundException(MessageConstant.STATUS_MUSIC_NOT_FOUND);
        }

        StatusMusic defaultStatus = defaultStatusOpt.get();

        // Ánh xạ dữ liệu
        Music music = musicMapper.toEntity(request, user, category, album);
        music.setStatusMusic(defaultStatus);

        musicRepository.save(music);
        return musicMapper.toResponse(music);
    }

    // Lấy tất cả nhạc hoặc lấy theo danh mục id category và thống kê
    public StatisticsMusicResponse getAllMusicWithStatistics(String categoryId, Pageable pageable) {
        // Tính tổng số lượng nhạc
        int totalMusic = (int) musicRepository.count();

        // Tính toán thống kê từ repository
        int totalMusicToday = musicRepository.countSongsByDay()
                .stream()
                .mapToInt(result -> ((Number) result[1]).intValue())
                .sum();

        int totalMusicThisWeek = musicRepository.countSongsByWeek()
                .stream()
                .mapToInt(result -> ((Number) result[2]).intValue())
                .sum();

        int totalMusicThisMonth = musicRepository.countSongsByMonth()
                .stream()
                .mapToInt(result -> ((Number) result[1]).intValue())
                .sum();

        int totalMusicThisYear = musicRepository.countSongsByYear()
                .stream()
                .mapToInt(result -> ((Number) result[1]).intValue())
                .sum();

        // Lấy danh sách tổng số bài hát theo trạng thái
        List<Object[]> statusMusicCounts = musicRepository.countSongsByStatus();
        Map<String, Integer> statusCountMap = new HashMap<>();

        // Lưu vào map (key: statusName, value: totalCount)
        for (Object[] result : statusMusicCounts) {
            statusCountMap.put((String) result[0], ((Number) result[1]).intValue());
        }

        // Lấy tất cả trạng thái từ database
        List<StatusMusic> allStatuses = statusMusicRepository.findAll();
        List<StatusMusicCountResponse> totalMusicByStatus = new ArrayList<>();

        // Đảm bảo tất cả trạng thái đều có mặt, nếu không có bài thì count = 0
        for (StatusMusic status : allStatuses) {
            totalMusicByStatus.add(new StatusMusicCountResponse(
                    status.getNameStatus(),
                    statusCountMap.getOrDefault(status.getNameStatus(), 0) // Mặc định là 0 nếu không có bài
            ));
        }

        // Kiểm tra categoryId và lấy danh sách nhạc tương ứng
        Page<Music> musicPage;
        if (categoryId == null || categoryId.isEmpty()) {
            musicPage = musicRepository.findAll(pageable);
        } else {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.CATEGORY_NOT_FOUND));
            musicPage = musicRepository.findByCategory(category, pageable);
        }

        // Tạo danh sách nhạc response
        List<MusicResponse> musics = musicPage.stream()
                .map(musicMapper::toResponse)
                .toList();

        return StatisticsMusicResponse.builder()
                .musics(musics)
                .totalMusic(totalMusic)
                .totalMusicToday(totalMusicToday)
                .totalMusicThisWeek(totalMusicThisWeek)
                .totalMusicThisMonth(totalMusicThisMonth)
                .totalMusicThisYear(totalMusicThisYear)
                .totalMusicByStatus(totalMusicByStatus) // Gán tổng số bài hát theo trạng thái
                .build();
    }

    //    xóa music theo id
    public void deleteMusic(String musicId) {
        Music music = getMusicById(musicId);
        String userEmail = music.getUser().getEmail();

        if (music.getThumbnailUrl() != null && music.getMusicUrl() != null) {
            try {
                String oldImageMusicPublicId = getPublicIdFromUrl(music.getThumbnailUrl());
                String oldMusicFilePublicId = getPublicIdFromUrl(music.getMusicUrl());
                cloudinaryService.deleteFile(oldImageMusicPublicId, "raw");
                cloudinaryService.deleteFile(oldMusicFilePublicId, "raw");
            } catch (IOException e) {
                log.error("Lỗi khi xóa nhạc và ảnh từ Cloudinary: {}", e.getMessage());
            }
        }

        musicRepository.deleteById(musicId);

        // Gửi email thông báo
        try {
            emailService.sendMusicDeletionNotification(
                    userEmail,
                    "Your song has been deleted",
                    "Your song '" + music.getMusicName() + "' has been removed from our platform."
            );
        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email thông báo xóa nhạc: {}", e.getMessage());
        }
    }

    // Kiểm tra sự tồn tại của music
    private Music getMusicById(String musicId) {
        return musicRepository.findById(musicId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.MUSIC_NOT_FOUND));
    }

    //    Kiểm tra sự tồn tại của album
    private Album getAlbumById(String albumId) {
        return albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.ALBUM_NOT_FOUND));
    }

    // Kiểm tra sự tồn tại của user
    private void getUserById(String userId) {
        UserAccessUtils.checkUserAccess(userId);
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND);
        }
    }

    // Chuyển đổi music thành MusicResponse
    private MusicResponse toAlbumResponse(Music music) {
        return musicMapper.toResponse(music);
    }

    //  kiểm tra sự tồn tại của album
    private void checkAlbumExists(String albumId) {
        if (!albumRepository.existsById(albumId)) {
            throw new ResourceNotFoundException(MessageConstant.ALBUM_NOT_FOUND);
        }
    }

    // Lấy tất cả music của user theo userId hoặc theo cả id album của user đó
    public List<MusicResponse> getAllMusicByUserIdOrAlbumId(String userId, String albumId) {
        getUserById(userId);
        List<Music> musics;

        if (albumId != null && !albumId.isEmpty()) {
            checkAlbumExists(albumId);
            musics = musicRepository.findByUser_IdAndAlbum_Id(userId, albumId);
        } else {
            musics = musicRepository.findByUser_Id(userId);
        }
        return musics.stream().map(this::toAlbumResponse).toList();
    }

    // cập nhật thêm nhạc vào album bằng cách sửa id album trong bảng nhạc
    public MusicResponse updateMusicAlbumId(String musicId, String albumId) {
        Music music = getMusicById(musicId);
        Album album = getAlbumById(albumId);
        music.setAlbum(album);
        Music updatedMusic = musicRepository.save(music);
        return toAlbumResponse(updatedMusic);
    }

    // Phương thức xóa các Music không có License
    public Long deleteOrphanMusic() {
        return musicRepository.deleteByLicensesIsNull();
    }

    public List<Music> findOrphanMusic() {
        return musicRepository.findOrphanMusic();
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public List<MusicResponse> updateStatusForMultipleMusic(UpdateMusicStatusRequest request) {
        StatusMusic statusMusic = statusMusicRepository.findById(request.getStatusMusicId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.STATUS_MUSIC_NOT_FOUND));

        List<Music> musicList = musicRepository.findAllById(request.getMusicIds());
        if (musicList.isEmpty()) {
            throw new ResourceNotFoundException(MessageConstant.MUSIC_NOT_FOUND);
        }

        musicList.forEach(music -> music.setStatusMusic(statusMusic));
        musicRepository.saveAll(musicList);

        return musicList.stream().map(musicMapper::toResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public MusicResponse updatePlatformReleased(String musicId, UpdatePlatformRequest request) {
        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.MUSIC_NOT_FOUND));

        music.setPlatformReleased(request.getPlatformReleased());
        Music updatedMusic = musicRepository.save(music);

        return musicMapper.toResponse(updatedMusic);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public MusicResponse updateUpcOrIsrc(String musicId, UpdateUpcIsrcRequest request) {
        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.MUSIC_NOT_FOUND));

        // Nếu request gửi null thì giữ nguyên, nếu gửi "" thì xóa giá trị
        if (request.getUpc() != null) {
            music.setUpc(request.getUpc()); // Chấp nhận cả "" (xóa UPC)
        }
        if (request.getIsrc() != null) {
            music.setIsrc(request.getIsrc()); // Chấp nhận cả "" (xóa ISRC)
        }

        Music updatedMusic = musicRepository.save(music);
        return musicMapper.toResponse(updatedMusic);
    }



}
