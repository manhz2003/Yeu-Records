package org.manhdev.testcrudspringboot.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MusicRequest {
    String categoryId;
    String userId;
    String albumId;

    @NotBlank(message = "musicName URL is required")
    String musicName;
    String description;
    String fileFormat;

    @NotBlank(message = "musicUrl URL is required")
    String musicUrl;

    @NotBlank(message = "thumbnailUrl URL is required")
    String thumbnailUrl;
}
