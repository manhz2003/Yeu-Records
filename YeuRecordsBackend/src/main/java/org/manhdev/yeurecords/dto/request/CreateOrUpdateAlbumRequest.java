package org.manhdev.yeurecords.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateOrUpdateAlbumRequest {
    @NotBlank(message = "Album name is required")
    String name;

    @NotBlank(message = "Thumbnail URL is required")
    String thumbnailUrl;
}
