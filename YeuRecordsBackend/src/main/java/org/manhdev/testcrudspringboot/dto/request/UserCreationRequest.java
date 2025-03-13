package org.manhdev.testcrudspringboot.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.manhdev.testcrudspringboot.validator.DobConstraint;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    @Size(min = 6, message = "PASSWORD_INVALID")
    String password;

    String fullname;

    @Email(message = "EMAIL_INVALID")
    String email;
    String address;

    @Builder.Default
    String oauthProvider = "system";

    @Pattern(regexp = "0\\d{9}", message = "PHONE_INVALID")
    String phone;
    String avatar;

    @DobConstraint(min = 10, message = "INVALID_DOB")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    LocalDate dob;

}
