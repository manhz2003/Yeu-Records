package org.manhdev.testcrudspringboot.controller;

import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.testcrudspringboot.dto.request.ApiResponse;
import org.manhdev.testcrudspringboot.model.User;
import org.manhdev.testcrudspringboot.service.EmailService;
import org.manhdev.testcrudspringboot.service.UserService;
import org.manhdev.testcrudspringboot.util.GeneratePassword;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RestController
@RequestMapping("/email")
public class EmailController {

    // Định nghĩa hằng số
    private static final String EMAIL_KEY = "email";

    EmailService emailService;
    UserService userService;
    PasswordEncoder passwordEncoder;

    @PostMapping("/send-email-activate")
    public ApiResponse<String> sendEmail(@RequestBody Map<String, String> request) throws MessagingException {
        String toEmail = request.get(EMAIL_KEY);
        User user = userService.findByEmail(toEmail).orElseThrow(() -> new RuntimeException("User not found"));

        // Tạo mã xác nhận ngẫu nhiên 6 ký tự
        String verificationCode = UUID.randomUUID().toString().substring(0, 6);
        emailService.sendVerificationCodeEmail(toEmail, "Xác nhận tài khoản Yeu Record", verificationCode);

        // Lưu mã xác nhận vào cơ sở dữ liệu hoặc bộ nhớ để xác thực sau
        user.setVerificationCode(verificationCode);
        userService.save(user);

        return ApiResponse.<String>builder()
                .code(200)
                .message("Email xác nhận đã được gửi tới " + toEmail)
                .result(null)
                .build();
    }

    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<String>> verifyCode(@RequestBody Map<String, String> request) {
        String toEmail = request.get(EMAIL_KEY);
        String verificationCode = request.get("code");

        User user = userService.findByEmail(toEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getVerificationCode().equals(verificationCode)) {
            user.setStatus(1);
            user.setActiveEmail(true);
            userService.save(user);

            ApiResponse<String> response = ApiResponse.<String>builder()
                    .code(200)
                    .message("Tài khoản đã được kích hoạt thành công!")
                    .result(null)
                    .build();

            return ResponseEntity.ok(response);
        } else {
            ApiResponse<String> response = ApiResponse.<String>builder()
                    .code(400)
                    .message("Mã xác nhận không chính xác!")
                    .result(null)
                    .build();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> request) {
        String toEmail = request.get(EMAIL_KEY);

        Optional<User> optionalUser = userService.findByEmail(toEmail);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<String>builder()
                            .code(404)
                            .message("Email không tồn tại trong hệ thống!")
                            .build());
        }

        User user = optionalUser.get();
        String newPassword = GeneratePassword.generateRandomPassword();
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        userService.save(user);

        try {
            emailService.sendNewPasswordEmail(toEmail, "Mật khẩu mới của bạn", newPassword);

            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .code(200)
                    .message("Mật khẩu mới đã được gửi tới email của bạn!")
                    .build());

        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email mật khẩu mới: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<String>builder()
                            .code(500)
                            .message("Có lỗi xảy ra khi gửi email!")
                            .build());
        }
    }


}

