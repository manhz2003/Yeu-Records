package org.manhdev.yeurecords.dto.response;

import java.time.LocalDate;
import java.util.Date;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String fullname;
    String email;
    String address;
    String avatar;
    String gender;
    String phone;
    String oauthProvider;
    String contactFacebook;
    String contactInstagram;
    String contactTelegram;
    String digitalSpotify;
    String digitalAppleMusic;
    String digitalTiktok;
    int status;
    boolean statusOnline;
    boolean lockout;
    boolean activeEmail;
    int totalMusic;
    double amountPayable;
    Date createdAt;
    Date updatedAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    LocalDate dob;
    Set<RoleResponse> roles;

    Set<PaymentInfoResponse> paymentInfos;
}
