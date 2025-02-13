package org.manhdev.testcrudspringboot.configuration;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.testcrudspringboot.service.DigitalSignatureService;
import org.manhdev.testcrudspringboot.service.MusicService;
import org.manhdev.testcrudspringboot.service.UserService;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Configuration
@Slf4j

// kích hoạt tính năng lập lịch
@EnableScheduling
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

// class này dùng để lập lịch spring boot tự động thực hiện nhiệm vụ sau 1 khoảng thời gian
public class AccountCleanupTask {
    UserService userService;
    MusicService musicService;
    DigitalSignatureService digitalSignatureService;

    // Xóa các tài khoản không kích hoạt sau 24h
    @Scheduled(fixedRate = 86400000)
    public void cleanupInactiveAccounts() {
        // Lấy thời điểm hiện tại trừ đi 24h
        Date cutoffDate = Date.from(LocalDateTime.now().minusHours(24).atZone(ZoneId.systemDefault()).toInstant());

        // Lấy danh sách các tài khoản chưa kích hoạt
        userService.findInactiveAccounts(cutoffDate).forEach(user -> {
            // Xóa chữ ký số của người dùng trước khi xóa tài khoản
            digitalSignatureService.deleteDigitalSignature(user);
            log.info("Đã xóa chữ ký số của người dùng: {}", user.getEmail());
        });

        // Xóa tài khoản không kích hoạt
        userService.deleteInactiveAccounts(cutoffDate);
        log.info("Đã xóa các tài khoản không được kích hoạt.");
    }

    // Lịch trình xóa các bản ghi Music không có License sau 7 ngày
    @Scheduled(fixedRate = 604800000)
    public void cleanupOrphanMusic() {
        Long total = musicService.deleteOrphanMusic();
        log.info("Đã xóa các bản ghi Music không có License. {}", total);
    }

}
