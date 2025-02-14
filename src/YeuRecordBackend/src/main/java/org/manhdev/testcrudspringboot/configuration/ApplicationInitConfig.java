package org.manhdev.testcrudspringboot.configuration;

import java.util.HashSet;

import org.manhdev.testcrudspringboot.constant.PredefinedRole;
import org.manhdev.testcrudspringboot.model.Role;
import org.manhdev.testcrudspringboot.model.User;
import org.manhdev.testcrudspringboot.repository.RoleRepository;
import org.manhdev.testcrudspringboot.repository.UserRepository;
import org.manhdev.testcrudspringboot.service.DigitalSignatureService;  // import service tạo chữ ký số
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {
    PasswordEncoder passwordEncoder;
    DigitalSignatureService digitalSignatureService;

    @NonFinal
    static final String ADMIN_USER_NAME = "azusa.producer@gmail.com";

    @NonFinal
    static final String ADMIN_PASS = "Yeurecord686868";

    @Bean
    @ConditionalOnProperty(
            prefix = "spring",
            value = "datasource.driver-class-name",
            havingValue = "com.mysql.cj.jdbc.Driver")
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        log.info("Khởi tạo ứng dụng");
        return args -> {
            if (userRepository.findByEmail(ADMIN_USER_NAME).isEmpty()) {
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
                        .email(ADMIN_USER_NAME)
                        .password(passwordEncoder.encode(ADMIN_PASS))
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

            log.info("Đã hoàn tất khởi tạo ứng dụng .....");
        };
    }
}
