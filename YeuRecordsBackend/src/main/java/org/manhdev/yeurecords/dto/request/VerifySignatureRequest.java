package org.manhdev.yeurecords.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VerifySignatureRequest {
    String digitalSignature;
    String publicKeyBase64;
}
