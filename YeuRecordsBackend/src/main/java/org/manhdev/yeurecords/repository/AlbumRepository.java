package org.manhdev.yeurecords.repository;

import org.manhdev.yeurecords.model.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface AlbumRepository extends JpaRepository<Album, String> {
    List<Album> findByUser_Id(String userId);

    @Query("SELECT COUNT(a) FROM Album a WHERE a.createdAt BETWEEN :startDate AND :endDate")
    int countNewAlbums(Date startDate, Date endDate);

    @Query("SELECT a FROM Album a JOIN a.user u WHERE a.deletedAt IS NULL")
    Page<Album> findAllAlbumsWithArtist(Pageable pageable);

    long count();
}
