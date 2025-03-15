package org.manhdev.yeurecords.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.manhdev.yeurecords.model.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SignatureVerificationRequest {
    String digitalSignature;
    String publicKey;
    User user;
}
