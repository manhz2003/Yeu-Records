package org.manhdev.yeurecords.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.yeurecords.dto.response.StatisticalResponse;
import org.manhdev.yeurecords.repository.AlbumRepository;
import org.manhdev.yeurecords.repository.MusicRepository;
import org.manhdev.yeurecords.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardService {
    UserRepository userRepository;
    MusicRepository musicRepository;
    AlbumRepository albumRepository;

    // Thống kê người dùng
    public Map<String, Object> getUserStats() {
        long totalUsers = userRepository.count();
        long onlineUsers = userRepository.countByStatusOnline(true);
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("onlineUsers", onlineUsers);
        stats.put("offlineUsers", totalUsers - onlineUsers);
        return stats;
    }

    // Thống kê tài khoản bị khóa
    public Map<String, Object> getLockedAccountsStats() {
        long totalUsers = userRepository.count();
        long lockedAccounts = userRepository.countByStatus(2);  // assuming 2 means locked
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("lockedAccounts", lockedAccounts);
        stats.put("normalAccounts", totalUsers - lockedAccounts);
        return stats;
    }

    // Thống kê nhạc và album
    public Map<String, Object> getMusicAndAlbumStats() {
        long totalSongs = musicRepository.count();
        long totalAlbums = albumRepository.count();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSongs", totalSongs);
        stats.put("totalAlbums", totalAlbums);

        return stats;
    }

    // Thống kê số bài hát phát hành theo tháng
    public Map<String, Object> getMonthlySongsRelease() {
        Map<String, Object> stats = new HashMap<>();
        List<Object[]> monthlyData = musicRepository.countSongsByMonth();
        stats.put("monthlyData", monthlyData);
        return stats;
    }

    // Tổ hợp các thống kê và trả về dưới dạng StatisticalResponse
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public StatisticalResponse getAllDashboardStats() {
        Map<String, Object> userStats = getUserStats();
        Map<String, Object> lockedAccountsStats = getLockedAccountsStats();
        Map<String, Object> musicAndAlbumStats = getMusicAndAlbumStats();
        Map<String, Object> monthlySongsRelease = getMonthlySongsRelease();

        return new StatisticalResponse(
                userStats,
                lockedAccountsStats,
                musicAndAlbumStats,
                monthlySongsRelease
        );
    }
}
