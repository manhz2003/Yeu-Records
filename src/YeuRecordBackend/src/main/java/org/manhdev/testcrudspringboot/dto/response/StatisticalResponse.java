package org.manhdev.testcrudspringboot.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatisticalResponse {
    Map<String, Object> userStats;
    Map<String, Object> lockedAccountsStats;
    Map<String, Object> musicAndAlbumStats;
    Map<String, Object> monthlySongsRelease;
}
