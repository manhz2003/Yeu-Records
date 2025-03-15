package org.manhdev.yeurecords.repository;

import jakarta.transaction.Transactional;
import org.manhdev.yeurecords.model.Category;
import org.manhdev.yeurecords.model.Music;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MusicRepository extends JpaRepository<Music, String> {
    int countByUserId(String userId);
    int countByAlbumIsNull();

    long count();

    @Query("SELECT COUNT(m) FROM Music m WHERE m.user.id = :userId")
    int countMusicsByUserId(@Param("userId") String userId);

    Page<Music> findByCategory(Category category, Pageable pageable);

    @Query("SELECT MONTH(m.createdAt), COUNT(m) FROM Music m GROUP BY MONTH(m.createdAt)")
    List<Object[]> countSongsByMonth();

    @Query("SELECT DATE(m.createdAt), COUNT(m) FROM Music m GROUP BY DATE(m.createdAt)")
    List<Object[]> countSongsByDay();

    @Query("SELECT FUNCTION('YEAR', m.createdAt), FUNCTION('WEEK', m.createdAt), COUNT(m) FROM Music m GROUP BY FUNCTION('YEAR', m.createdAt), FUNCTION('WEEK', m.createdAt)")
    List<Object[]> countSongsByWeek();

    @Query("SELECT YEAR(m.createdAt), COUNT(m) FROM Music m GROUP BY YEAR(m.createdAt)")
    List<Object[]> countSongsByYear();

    List<Music> findByUser_IdAndAlbum_Id(String userId, String albumId);

    List<Music> findByUser_Id(String userId);

    // Query để xóa các Music không có License
    @Transactional
    long deleteByLicensesIsNull();

    @Query("SELECT s.nameStatus, COUNT(m) FROM Music m JOIN m.statusMusic s GROUP BY s.nameStatus")
    List<Object[]> countSongsByStatus();

    // Tìm các bài nhạc không có giấy phép
    @Query("SELECT m FROM Music m WHERE m.id NOT IN (SELECT l.music.id FROM License l)")
    List<Music> findOrphanMusic();

}