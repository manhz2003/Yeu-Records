package org.manhdev.testcrudspringboot.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.manhdev.testcrudspringboot.constant.MessageConstant;
import org.manhdev.testcrudspringboot.constant.PaginationConstants;
import org.manhdev.testcrudspringboot.dto.request.*;
import org.manhdev.testcrudspringboot.dto.response.MusicResponse;
import org.manhdev.testcrudspringboot.dto.response.StatisticsMusicResponse;
import org.manhdev.testcrudspringboot.service.MusicService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/music")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MusicController {
    MusicService musicService;

    //    tạo music
    @PostMapping
    public ResponseEntity<ApiResponse<MusicResponse>> createMusic(@RequestBody @Valid MusicRequest musicRequest) {
        MusicResponse musicResponse = musicService.createMusic(musicRequest);
        ApiResponse<MusicResponse> apiResponse = ApiResponse.<MusicResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Music created successfully")
                .result(musicResponse)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    // Lấy tất cả nhạc hoặc lấy theo danh mục id category và thống kê
    @GetMapping({"", "/{categoryId}"})
    public ResponseEntity<ApiResponse<StatisticsMusicResponse>> getAllMusicWithStatistics(
            @PathVariable(required = false) String categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (size > PaginationConstants.MAX_PAGE_SIZE) {
            throw new IllegalArgumentException(
                    MessageConstant.MAX_SIZE_MESS + PaginationConstants.MAX_PAGE_SIZE);
        }

        Pageable pageable = PageRequest.of(page, size);
        StatisticsMusicResponse statisticsMusicResponse = musicService.getAllMusicWithStatistics(categoryId, pageable);

        ApiResponse<StatisticsMusicResponse> apiResponse = ApiResponse.<StatisticsMusicResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Music statistics retrieved successfully")
                .result(statisticsMusicResponse)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    //    xóa nhạc theo id
    @DeleteMapping("/{musicId}")
    public ResponseEntity<Void> deleteMusic(@PathVariable String musicId) {
        musicService.deleteMusic(musicId);
        return ResponseEntity.noContent().build();
    }

    // Lấy tất cả music của user theo userId hoặc theo cả id album của user đó
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<MusicResponse>>> getAllMusicByUserIdOrAlbumId(
            @PathVariable String userId,
            @RequestParam(required = false) String albumId) {

        List<MusicResponse> musics = musicService.getAllMusicByUserIdOrAlbumId(userId, albumId);
        ApiResponse<List<MusicResponse>> apiResponse = ApiResponse.<List<MusicResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get music successfully")
                .result(musics)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    // cập nhật thêm nhạc vào album bằng cách sửa id album trong bảng nhạc
    @PutMapping("/{musicId}/album/{albumId}")
    public ResponseEntity<ApiResponse<MusicResponse>> updateMusicAlbumId(
            @PathVariable String musicId,
            @PathVariable String albumId) {

        MusicResponse updatedMusic = musicService.updateMusicAlbumId(musicId, albumId);
        ApiResponse<MusicResponse> apiResponse = ApiResponse.<MusicResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Updated album ID successfully")
                .result(updatedMusic)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/update-status")
    public ResponseEntity<ApiResponse<List<MusicResponse>>> updateStatusForMultipleMusic(
            @RequestBody @Valid UpdateMusicStatusRequest request) {

        List<MusicResponse> updatedMusics = musicService.updateStatusForMultipleMusic(request);

        ApiResponse<List<MusicResponse>> apiResponse = ApiResponse.<List<MusicResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Updated status for multiple music successfully")
                .result(updatedMusics)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{musicId}/update-platform")
    public ResponseEntity<ApiResponse<MusicResponse>> updatePlatformReleased(
            @PathVariable String musicId,
            @RequestBody @Valid UpdatePlatformRequest request) {

        MusicResponse updatedMusic = musicService.updatePlatformReleased(musicId, request);
        ApiResponse<MusicResponse> apiResponse = ApiResponse.<MusicResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Updated platformReleased successfully")
                .result(updatedMusic)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{musicId}/update-upc-isrc")
    public ResponseEntity<ApiResponse<MusicResponse>> updateUpcOrIsrc(
            @PathVariable String musicId,
            @RequestBody @Valid UpdateUpcIsrcRequest request) {

        MusicResponse updatedMusic = musicService.updateUpcOrIsrc(musicId, request);

        ApiResponse<MusicResponse> apiResponse = ApiResponse.<MusicResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Updated UPC/ISRC successfully")
                .result(updatedMusic)
                .build();

        return ResponseEntity.ok(apiResponse);
    }



}
