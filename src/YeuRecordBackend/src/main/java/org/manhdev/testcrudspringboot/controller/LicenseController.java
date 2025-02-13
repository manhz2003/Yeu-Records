package org.manhdev.testcrudspringboot.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.manhdev.testcrudspringboot.constant.MessageConstant;
import org.manhdev.testcrudspringboot.constant.PaginationConstants;
import org.manhdev.testcrudspringboot.dto.request.ApiResponse;
import org.manhdev.testcrudspringboot.dto.request.LicenseRequest;
import org.manhdev.testcrudspringboot.dto.response.LicenseResponse;
import org.manhdev.testcrudspringboot.service.LicenseService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/license")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LicenseController {
    LicenseService licenseService;

    @PostMapping
    public ResponseEntity<ApiResponse<LicenseResponse>> createLicense(@RequestBody @Valid LicenseRequest licenseRequest) {
        LicenseResponse licenseResponse = licenseService.createLicense(licenseRequest);
        ApiResponse<LicenseResponse> apiResponse = ApiResponse.<LicenseResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("License created successfully")
                .result(licenseResponse)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    //    xóa license theo id
    @DeleteMapping("/{licenseId}")
    public ResponseEntity<Void> deleteLicense(@PathVariable String licenseId) {
        licenseService.deleteLicense(licenseId);
        return ResponseEntity.noContent().build();
    }

    // Lấy danh sách giấy phép với phân trang
    @GetMapping
    public ResponseEntity<ApiResponse<Page<LicenseResponse>>> getLicenses(
            @RequestParam int page,
            @RequestParam int size) {

        if (size > PaginationConstants.MAX_PAGE_SIZE) {
            throw new IllegalArgumentException(
                    MessageConstant.MAX_SIZE_MESS + PaginationConstants.MAX_PAGE_SIZE);
        }

        Page<LicenseResponse> licensePage = licenseService.getAllLicenses(page, size);
        ApiResponse<Page<LicenseResponse>> apiResponse = ApiResponse.<Page<LicenseResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("License list retrieved successfully")
                .result(licensePage)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
