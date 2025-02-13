package org.manhdev.testcrudspringboot.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginSocialRequest {
    @Email(message = "EMAIL_INVALID")
    String email;
    @Pattern(regexp = "0[0-9]{9}", message = "PHONE_INVALID")
    String phone;
    String fullname;
    String avatar;
    boolean activeEmail;
    String oauthRefreshToken;
    String oauthAccessToken;
    String oauthProviderId;
    String oauthProvider;
    List<String> roles;
}
