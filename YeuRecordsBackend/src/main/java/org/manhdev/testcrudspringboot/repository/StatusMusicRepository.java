package org.manhdev.testcrudspringboot.repository;

import org.manhdev.testcrudspringboot.model.StatusMusic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatusMusicRepository extends JpaRepository<StatusMusic, String> {
    Optional<StatusMusic> findByNameStatus(String nameStatus);
}
