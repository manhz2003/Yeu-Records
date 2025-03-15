package org.manhdev.yeurecords.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Pattern;
import org.manhdev.yeurecords.validator.DobConstraint;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserRequest {
    String fullname;
    String address;
    @Pattern(regexp = "0\\d{9}", message = "PHONE_INVALID")
    String phone;
    String avatar;
    String gender;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    @DobConstraint(min = 18, message = "INVALID_DOB")
    LocalDate dob;

    @Builder.Default
    String oauthProvider = "system";

    String contactFacebook;
    String contactInstagram;
    String contactTelegram;
    String digitalSpotify;
    String digitalAppleMusic;
    String digitalTiktok;

}
