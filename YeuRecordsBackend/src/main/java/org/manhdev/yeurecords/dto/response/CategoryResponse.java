package org.manhdev.yeurecords.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryResponse {
    String id;
    String categoryName;
    String description;
    int totalMusic;
    String createdAt;
    String updatedAt;
}