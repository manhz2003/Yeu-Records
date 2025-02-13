package org.manhdev.testcrudspringboot.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatisticsMusicResponse {
    private List<MusicResponse> musics;
    private int totalMusic;
    private int totalMusicToday;
    private int totalMusicThisWeek;
    private int totalMusicThisMonth;
    private int totalMusicThisYear;
}

