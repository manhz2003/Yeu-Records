package org.manhdev.yeurecords.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatisticsMusicResponse {
    List<MusicResponse> musics;
    int totalMusic;
    int totalMusicToday;
    int totalMusicThisWeek;
    int totalMusicThisMonth;
    int totalMusicThisYear;

    List<StatusMusicCountResponse> totalMusicByStatus;
}

