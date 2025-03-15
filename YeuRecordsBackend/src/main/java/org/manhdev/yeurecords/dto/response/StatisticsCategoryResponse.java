package org.manhdev.yeurecords.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatisticsCategoryResponse {
    int totalCategory;
    int totalAlbum;
    int unalbumedMusic;
    int newAlbumToday;
    int newCategoryToday;
}
