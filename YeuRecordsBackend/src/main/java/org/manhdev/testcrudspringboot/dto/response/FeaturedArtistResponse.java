package org.manhdev.testcrudspringboot.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeaturedArtistResponse {
    String id;
    String nameArtist;
    String avatar;
    int isuance;
}
