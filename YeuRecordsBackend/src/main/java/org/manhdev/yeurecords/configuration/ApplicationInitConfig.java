package org.manhdev.yeurecords.configuration;

import java.util.HashSet;
import java.util.List;

import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.manhdev.yeurecords.constant.PredefinedRole;
import org.manhdev.yeurecords.model.Role;
import org.manhdev.yeurecords.model.StatusMusic;
import org.manhdev.yeurecords.model.User;
import org.manhdev.yeurecords.repository.RoleRepository;
import org.manhdev.yeurecords.repository.StatusMusicRepository;
import org.manhdev.yeurecords.repository.UserRepository;
import org.manhdev.yeurecords.service.DigitalSignatureService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {
    PasswordEncoder passwordEncoder;
    DigitalSignatureService digitalSignatureService;
    StatusMusicRepository statusMusicRepository;

    @NonFinal
    @Value("${admin.default.username}")
    private String adminUsername;

    @NonFinal
    @Value("${admin.default.password}")
    private String adminPassword;

    @Bean
    @ConditionalOnProperty(
            prefix = "spring",
            value = "datasource.driver-class-name",
            havingValue = "com.mysql.cj.jdbc.Driver")
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        log.info("Khởi tạo ứng dụng");
        return args -> {
            if (userRepository.findByEmail(adminUsername).isEmpty()) {
                roleRepository.save(Role.builder()
                        .name(PredefinedRole.USER_ROLE)
                        .description("Đây là quyền của nghệ sĩ")
                        .build());

                Role adminRole = roleRepository.save(Role.builder()
                        .name(PredefinedRole.ADMIN_ROLE)
                        .description("Đây là quyền của admin")
                        .build());

                var roles = new HashSet<Role>();
                roles.add(adminRole);

                User user = User.builder()
                        .email(adminUsername)
                        .password(passwordEncoder.encode(adminPassword))
                        .oauthProvider("system")
                        .fullname("Nguyen Thanh Hai")
                        .roles(roles)
                        .activeEmail(true)
                        .status(1)
                        .build();

                user = userRepository.save(user);
                // Tạo chữ ký số cho admin sau khi tạo người dùng
                digitalSignatureService.createDigitalSignature(user);
            }

            // Kiểm tra và tạo role STAFF nếu chưa tồn tại
            if (!roleRepository.existsById("STAFF")) {
                Role staffRole = roleRepository.save(Role.builder()
                        .name("STAFF")
                        .description("Đây là quyền của nhân viên")
                        .build());
                log.info("Tạo role STAFF thành công: {}", staffRole);
            }

            // Kiểm tra và tạo các trạng thái StatusMusic
            List<String> predefinedStatuses = List.of("Waiting for censorship", "Censor", "Published");
            for (String statusName : predefinedStatuses) {
                if (statusMusicRepository.findByNameStatus(statusName).isEmpty()) {
                    StatusMusic status = statusMusicRepository.save(StatusMusic.builder()
                            .nameStatus(statusName)
                            .build());
                    log.info("Tạo trạng thái StatusMusic: {}", status.getNameStatus());
                }
            }

            log.info("Đã hoàn tất khởi tạo ứng dụng .....");
        };
    }

}
