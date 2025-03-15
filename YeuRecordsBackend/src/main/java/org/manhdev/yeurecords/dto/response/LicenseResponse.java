package org.manhdev.yeurecords.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LicenseResponse {
    String id;
    String fullName;
    String pdfUrl;
    String musicName;
    String createdAt;
    String updatedAt;
}
