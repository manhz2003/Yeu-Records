package org.manhdev.testcrudspringboot.repository;

import jakarta.transaction.Transactional;
import org.manhdev.testcrudspringboot.model.Category;
import org.manhdev.testcrudspringboot.model.Music;
import org.manhdev.testcrudspringboot.model.StatusMusic;
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

    Page<Music> findByStatusMusic(StatusMusic statusMusic, Pageable pageable);

    Page<Music> findByCategoryAndStatusMusic(Category category, StatusMusic statusMusic, Pageable pageable);
}