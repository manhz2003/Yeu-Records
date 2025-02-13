package org.manhdev.testcrudspringboot.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class EmailService {

    JavaMailSender mailSender;

    public void sendVerificationCodeEmail(String toEmail, String subject, String verificationCode) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        // Tạo nội dung HTML với mã xác nhận
        String htmlContent = createVerificationCodeEmailContent(verificationCode);

        helper.setFrom("YeuRecord <manhmafia113@gmail.com>");
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
        log.info("Gửi email xác nhận thành công ...");
    }

    public void sendNewPasswordEmail(String toEmail, String subject, String newPassword) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        // Tạo nội dung HTML cho email mật khẩu mới
        String htmlContent = createNewPasswordEmailContent(newPassword);

        helper.setFrom("YeuRecord <manhmafia113@gmail.com>");
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
        log.info("Gửi email mật khẩu mới thành công ...");
    }

    //  nội dung HTML cho email xác nhận
    private String createVerificationCodeEmailContent(String verificationCode) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>Verify Your Yeu Record Account</title>\n" +
                "    <style> ... </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "<div class=\"container\">\n" +
                "    <h2>Verify Your Yeu Record Account</h2>\n" +
                "    <p>Hello,</p>\n" +
                "    <p>Thank you for signing up for Yeu Record! To complete your registration, please use the following verification code:</p>\n" +
                "    <h3>" + verificationCode + "</h3>\n" +
                "    <p>If you did not create an account with Yeu Record, please ignore this email.</p>\n" +
                "    <p>Thank you for choosing Yeu Record!</p>\n" +
                "    <p>Best regards,<br>The Yeu Record Team</p>\n" +
                "</div>\n" +
                "</body>\n" +
                "</html>";
    }

    //  nội dung HTML cho email mật khẩu mới
    private String createNewPasswordEmailContent(String newPassword) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>Your New Yeu Record Password</title>\n" +
                "    <style> ... </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "<div class=\"container\">\n" +
                "    <h2>Your New Yeu Record Password</h2>\n" +
                "    <p>Hello,</p>\n" +
                "    <p>Your request to reset your password has been processed. Your new password is:</p>\n" +
                "    <h3>" + newPassword + "</h3>\n" +
                "    <p>We recommend changing this password after logging in.</p>\n" +
                "    <p>Thank you for choosing Yeu Record!</p>\n" +
                "    <p>Best regards,<br>The Yeu Record Team</p>\n" +
                "</div>\n" +
                "</body>\n" +
                "</html>";
    }
}
