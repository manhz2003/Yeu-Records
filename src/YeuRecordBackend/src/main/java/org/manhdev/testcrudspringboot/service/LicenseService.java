package org.manhdev.testcrudspringboot.service;

import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.testcrudspringboot.constant.MessageConstant;
import org.manhdev.testcrudspringboot.dto.request.LicenseRequest;
import org.manhdev.testcrudspringboot.dto.response.LicenseResponse;
import org.manhdev.testcrudspringboot.exception.ResourceNotFoundException;
import org.manhdev.testcrudspringboot.mapper.LicenseMapper;
import org.manhdev.testcrudspringboot.model.*;
import org.manhdev.testcrudspringboot.repository.LicenseRepository;
import org.manhdev.testcrudspringboot.repository.MusicRepository;
import org.manhdev.testcrudspringboot.repository.UserRepository;
import org.manhdev.testcrudspringboot.util.UserAccessUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.io.IOException;

import static org.manhdev.testcrudspringboot.util.HandleStringCloudinary.getPublicIdFromUrl;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LicenseService {
    LicenseRepository licenseRepository;
    LicenseMapper licenseMapper;
    UserRepository userRepository;
    MusicRepository musicRepository;
    CloudinaryService cloudinaryService;
    EmailService emailService;

    //    create license
    public LicenseResponse createLicense(LicenseRequest licenseRequest) {
        User user = getUserById(licenseRequest.getUserId());
        Music music = getMusicById(licenseRequest.getMusicId());
        License license = licenseMapper.toEntity(licenseRequest, user, music);
        licenseRepository.save(license);

        // 📧 Gửi email thông báo phát hành nhạc
        try {
            String subject = "Notification of successful music playback";
            emailService.sendMusicReleaseNotification(user.getEmail(), subject, true);
            log.info("Đã gửi email thông báo phát hành nhạc đến {}", user.getEmail());
        } catch (MessagingException e) {
            log.error("Gửi email thất bại: {}", e.getMessage());
        }

        return licenseMapper.toResponse(license);
    }


    private User getUserById(String userId) {
        UserAccessUtils.checkUserAccess(userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));
    }

    private Music getMusicById(String musicId) {
        return musicRepository.findById(musicId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.MUSIC_NOT_FOUND));
    }

    private License getLicenseById(String licenseId) {
        return licenseRepository.findById(licenseId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.LICENSE_NOT_FOUND));
    }

    //   delete license
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteLicense(String licenseId) {
        License license = getLicenseById(licenseId);
        if (license.getPdfUrl() != null) {
            try {
                String filePdfUrl = getPublicIdFromUrl(license.getPdfUrl());
                cloudinaryService.deleteFile(filePdfUrl, "raw");
            } catch (IOException e) {
                log.error("Lỗi khi xóa music và ảnh music từ Cloudinary: {}", e.getMessage());
            }
        }
        licenseRepository.deleteById(licenseId);
    }

    // Phương thức lấy danh sách giấy phép với phân trang
    public Page<LicenseResponse> getAllLicenses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<License> licensePage = licenseRepository.findAll(pageable);
        // Chuyển đổi từ License sang LicenseResponse
        return licensePage.map(licenseMapper::toResponse);
    }

}
