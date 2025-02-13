package org.manhdev.testcrudspringboot.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.manhdev.testcrudspringboot.model.User;

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
