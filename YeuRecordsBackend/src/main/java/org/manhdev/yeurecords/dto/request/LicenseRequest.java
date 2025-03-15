package org.manhdev.yeurecords.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LicenseRequest {
    String userId;
    String musicId;
    @NotBlank(message = "pdfUrl URL is required")
    String pdfUrl;
}
