package org.manhdev.testcrudspringboot.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.manhdev.testcrudspringboot.dto.request.ApiResponse;
import org.manhdev.testcrudspringboot.dto.response.StatusMusicResponse;
import org.manhdev.testcrudspringboot.service.StatusMusicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/status-music")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatusMusicController {
    StatusMusicService statusMusicService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StatusMusicResponse>>> getAllStatusMusic() {
        List<StatusMusicResponse> statusMusicList = statusMusicService.getAllStatusMusic();

        ApiResponse<List<StatusMusicResponse>> response = ApiResponse.<List<StatusMusicResponse>>builder()
                .code(200)
                .message("Lấy danh sách trạng thái nhạc thành công")
                .result(statusMusicList)
                .build();

        return ResponseEntity.ok(response);
    }

}
