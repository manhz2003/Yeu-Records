package org.manhdev.testcrudspringboot.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MusicResponse {
    String id;
    String fullName;
    String categoryName;
    String albumName;
    String musicName;
    String description;
    String fileFormat;
    String musicUrl;
    String thumbnailUrl;
    String createdAt;
    String updatedAt;
}
