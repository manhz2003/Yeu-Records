package org.manhdev.testcrudspringboot.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatusMusicResponse {
    String id;
    String nameStatus;
    String createdAt;
    String updatedAt;
}
