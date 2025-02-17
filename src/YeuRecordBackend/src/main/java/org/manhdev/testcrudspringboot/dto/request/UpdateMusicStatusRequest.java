package org.manhdev.testcrudspringboot.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateMusicStatusRequest {
    List<String> musicIds;
    String statusMusicId;
}
