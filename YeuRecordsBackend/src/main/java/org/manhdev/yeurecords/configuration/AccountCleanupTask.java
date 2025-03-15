package org.manhdev.yeurecords.configuration;

import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.yeurecords.model.Music;
import org.manhdev.yeurecords.model.User;
import org.manhdev.yeurecords.service.DigitalSignatureService;
import org.manhdev.yeurecords.service.EmailService;
import org.manhdev.yeurecords.service.MusicService;
import org.manhdev.yeurecords.service.UserService;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

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
    EmailService emailService;

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
    @Scheduled(fixedRate = 604800000) // 7 ngày
    public void cleanupOrphanMusic() {
        // Lấy danh sách các bài nhạc bị xóa
        List<Music> deletedMusicList = musicService.findOrphanMusic();

        // Kiểm tra nếu có bài nhạc bị xóa
        if (!deletedMusicList.isEmpty()) {
            deletedMusicList.forEach(music -> {
                User owner = music.getUser(); // Giả sử mỗi bài nhạc có 1 chủ sở hữu
                if (owner != null) {
                    try {
                        String subject = "Your music has been removed";
                        String reason = "Your song was deleted due to lack of a valid license.";
                        emailService.sendMusicDeletionNotification(owner.getEmail(), subject, reason);
                        log.info("Đã gửi email thông báo xóa nhạc đến {}", owner.getEmail());
                    } catch (MessagingException e) {
                        log.error("Lỗi khi gửi email xóa nhạc: {}", e.getMessage());
                    }
                }
            });

            // Xóa các bài nhạc không có License
            Long totalDeleted = musicService.deleteOrphanMusic();
            log.info("Đã xóa {} bản nhạc không có License.", totalDeleted);
        } else {
            log.info("Không có bản nhạc nào cần xóa.");
        }
    }


}
