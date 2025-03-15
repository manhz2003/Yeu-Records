package org.manhdev.yeurecords.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.manhdev.yeurecords.dto.request.ApiResponse;
import org.manhdev.yeurecords.dto.response.StatisticalResponse;
import org.manhdev.yeurecords.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardController {
    DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<StatisticalResponse>> getDashboardStats() {
        // Lấy thống kê từ service
        StatisticalResponse stats = dashboardService.getAllDashboardStats();

        // Tạo phản hồi với thông tin thống kê
        ApiResponse<StatisticalResponse> response = ApiResponse.<StatisticalResponse>builder()
                .code(200)
                .message("Dashboard statistics fetched successfully")
                .result(stats)
                .build();

        return ResponseEntity.ok(response);
    }
}
