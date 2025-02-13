package org.manhdev.testcrudspringboot.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.testcrudspringboot.constant.MessageConstant;
import org.manhdev.testcrudspringboot.dto.request.MusicRequest;
import org.manhdev.testcrudspringboot.dto.response.MusicResponse;
import org.manhdev.testcrudspringboot.dto.response.StatisticsMusicResponse;
import org.manhdev.testcrudspringboot.exception.ResourceNotFoundException;
import org.manhdev.testcrudspringboot.mapper.MusicMapper;
import org.manhdev.testcrudspringboot.model.Album;
import org.manhdev.testcrudspringboot.model.Category;
import org.manhdev.testcrudspringboot.model.Music;
import org.manhdev.testcrudspringboot.model.User;
import org.manhdev.testcrudspringboot.repository.AlbumRepository;
import org.manhdev.testcrudspringboot.repository.CategoryRepository;
import org.manhdev.testcrudspringboot.repository.MusicRepository;
import org.manhdev.testcrudspringboot.repository.UserRepository;
import org.manhdev.testcrudspringboot.util.UserAccessUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.List;

import static org.manhdev.testcrudspringboot.util.HandleStringCloudinary.getPublicIdFromUrl;

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

        Music music = musicMapper.toEntity(request, user, category, album);
        musicRepository.save(music);
        return musicMapper.toResponse(music);
    }

    // Lấy tất cả nhạc hoặc lấy theo danh mục id category và thống kê
    public StatisticsMusicResponse getAllMusicWithStatistics(String categoryId, Pageable pageable) {
        // Tính toán thống kê tổng số lượng nhạc
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

        // Kiểm tra categoryId và lấy dữ liệu nhạc tương ứng
        Page<Music> musicPage;
        if (categoryId == null || categoryId.isEmpty()) {
            musicPage = musicRepository.findAll(pageable);
        } else {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.CATEGORY_NOT_FOUND));
            musicPage = musicRepository.findByCategory(category, pageable);
        }

        // Tạo response
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
                .build();
    }

    //    xóa music theo id
    public void deleteMusic(String musicId) {
        Music music = getMusicById(musicId);
        if (music.getThumbnailUrl() != null && music.getMusicUrl() != null) {
            try {
                String oldImageMusicPublicId = getPublicIdFromUrl(music.getThumbnailUrl());
                String oldMusicFilePublicId = getPublicIdFromUrl(music.getMusicUrl());
                cloudinaryService.deleteFile(oldImageMusicPublicId, "raw");
                cloudinaryService.deleteFile(oldMusicFilePublicId, "raw");
            } catch (IOException e) {
                log.error("Lỗi khi xóa music và ảnh music từ Cloudinary: {}", e.getMessage());
            }
        }
        musicRepository.deleteById(musicId);
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

}
