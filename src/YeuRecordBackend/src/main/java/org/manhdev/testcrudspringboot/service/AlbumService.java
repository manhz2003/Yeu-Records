package org.manhdev.testcrudspringboot.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.testcrudspringboot.constant.MessageConstant;
import org.manhdev.testcrudspringboot.dto.request.CreateOrUpdateAlbumRequest;
import org.manhdev.testcrudspringboot.dto.response.AlbumResponse;
import org.manhdev.testcrudspringboot.exception.ResourceNotFoundException;
import org.manhdev.testcrudspringboot.mapper.AlbumMapper;
import org.manhdev.testcrudspringboot.model.Album;
import org.manhdev.testcrudspringboot.model.User;
import org.manhdev.testcrudspringboot.repository.AlbumRepository;
import org.manhdev.testcrudspringboot.repository.UserRepository;
import org.manhdev.testcrudspringboot.util.UserAccessUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

import static org.manhdev.testcrudspringboot.util.HandleStringCloudinary.getPublicIdFromUrl;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AlbumService {

    AlbumRepository albumRepository;
    UserRepository userRepository;
    AlbumMapper albumMapper;
    CloudinaryService cloudinaryService;

    // Kiểm tra sự tồn tại của user
    private User getUserById(String userId) {
        UserAccessUtils.checkUserAccess(userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));
    }

    // Kiểm tra sự tồn tại của Album
    private Album getAlbumById(String albumId) {
        return albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.ALBUM_NOT_FOUND));
    }

    // Chuyển đổi Album thành AlbumResponse
    private AlbumResponse toAlbumResponse(Album album) {
        return albumMapper.toAlbumResponse(album);
    }

    // Tạo album mới
    public AlbumResponse createAlbum(CreateOrUpdateAlbumRequest request, String userId) {
        User user = getUserById(userId);
        Album album = albumMapper.toAlbum(request);
        album.setUser(user);
        Album savedAlbum = albumRepository.save(album);
        return toAlbumResponse(savedAlbum);
    }

    // Lấy tất cả album theo userId
    public List<AlbumResponse> getAllAlbumsByUserId(String userId) {
        getUserById(userId);
        List<Album> albums = albumRepository.findByUser_Id(userId);
        return albums.stream()
                .map(this::toAlbumResponse)
                .toList();
    }

    // Cập nhật album theo albumId
    public AlbumResponse updateAlbum(String userId, String albumId, CreateOrUpdateAlbumRequest request) {
        // Kiểm tra quyền truy cập của người dùng đối với album
        UserAccessUtils.checkUserAccess(userId);
        Album album = getAlbumById(albumId);
        deleteOldAlbumImageIfNeeded(album, request.getThumbnailUrl());
        albumMapper.updateAlbumFromRequest(request, album);
        Album updatedAlbum = albumRepository.save(album);
        return toAlbumResponse(updatedAlbum);
    }

    // Xóa album theo albumId
    public void deleteAlbum(String userId, String albumId) {
        UserAccessUtils.checkUserAccess(userId);
        Album album = getAlbumById(albumId);
        if (album.getThumbnailUrl() != null) {
            try {
                String oldImagePublicId = getPublicIdFromUrl(album.getThumbnailUrl());
                cloudinaryService.deleteFile(oldImagePublicId, "raw");
            } catch (IOException e) {
                log.error("Lỗi khi xóa ảnh album từ Cloudinary: {}", e.getMessage());
            }
        }
        albumRepository.delete(album);
    }

    // Phương thức kiểm tra và xóa ảnh của album trên Cloud
    private void deleteOldAlbumImageIfNeeded(Album album, String newImageUrl) {
        if (album.getThumbnailUrl() != null && !album.getThumbnailUrl().equals(newImageUrl)) {
            try {
                String oldImagePublicId = getPublicIdFromUrl(album.getThumbnailUrl());
                cloudinaryService.deleteFile(oldImagePublicId, "raw");
            } catch (IOException e) {
                log.error("Error deleting old album image: {}", e.getMessage());
            }
        }
    }

    //    lấy tất cả album, có phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public Page<AlbumResponse> getAllAlbum(int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);

        // Truy vấn các album kèm theo thông tin về nghệ sĩ và bài hát
        Page<Album> albums = albumRepository.findAllAlbumsWithArtist(pageable);

        // Map data from Album to AlbumResponse
        return albums.map(album -> AlbumResponse.builder()
                .id(album.getId())
                .name(album.getAlbumName())
                .nameArtist(album.getUser().getFullname())
                .thumbnailUrl(album.getThumbnailUrl())
                .createdAt(album.getCreatedAt().toString())
                .updatedAt(album.getUpdatedAt().toString())
                // Trả về tổng số bài hát cho album
                .totalMusic(album.getMusics() != null ? album.getMusics().size() : 0)
                .build());
    }


}
