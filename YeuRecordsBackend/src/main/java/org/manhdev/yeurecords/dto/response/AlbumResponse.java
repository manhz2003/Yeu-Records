package org.manhdev.yeurecords.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AlbumResponse {
    String id;
    String name;
    int totalMusic;
    String nameArtist;
    String thumbnailUrl;
    String createdAt;
    String updatedAt;
}
