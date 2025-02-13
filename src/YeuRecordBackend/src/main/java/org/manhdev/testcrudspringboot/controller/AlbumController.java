package org.manhdev.testcrudspringboot.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.manhdev.testcrudspringboot.constant.MessageConstant;
import org.manhdev.testcrudspringboot.constant.PaginationConstants;
import org.manhdev.testcrudspringboot.dto.request.CreateOrUpdateAlbumRequest;
import org.manhdev.testcrudspringboot.dto.response.AlbumResponse;
import org.manhdev.testcrudspringboot.service.AlbumService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/albums")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AlbumController {

    AlbumService albumService;

    // Tạo album mới
    @PostMapping("/{userId}")
    public ResponseEntity<AlbumResponse> createAlbum(@PathVariable String userId,
                                                     @Valid @RequestBody CreateOrUpdateAlbumRequest request) {
        AlbumResponse albumResponse = albumService.createAlbum(request, userId);
        return ResponseEntity.ok(albumResponse);
    }

    // Lấy tất cả album của một user theo userId
    @GetMapping("/{userId}")
    public ResponseEntity<List<AlbumResponse>> getAllAlbumsByUserId(@PathVariable String userId) {
        List<AlbumResponse> albums = albumService.getAllAlbumsByUserId(userId);
        return ResponseEntity.ok(albums);
    }

    // Cập nhật album theo albumId
    @PutMapping("{userId}/{albumId}")
    public ResponseEntity<AlbumResponse> updateAlbum(@PathVariable String userId, @PathVariable String albumId,
                                                     @Valid @RequestBody CreateOrUpdateAlbumRequest request) {
        AlbumResponse albumResponse = albumService.updateAlbum(userId, albumId, request);
        return ResponseEntity.ok(albumResponse);
    }

    // Xóa album theo albumId
    @DeleteMapping("{userId}/{albumId}")
    public ResponseEntity<Void> deleteAlbum(@PathVariable String userId, @PathVariable String albumId) {
        albumService.deleteAlbum(userId, albumId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public Page<AlbumResponse> getAllAlbums(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (size > PaginationConstants.MAX_PAGE_SIZE) {
            throw new IllegalArgumentException(
                    MessageConstant.MAX_SIZE_MESS + PaginationConstants.MAX_PAGE_SIZE);
        }

        return albumService.getAllAlbum(page, size);
    }
}
