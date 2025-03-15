package org.manhdev.yeurecords.repository;

import org.manhdev.yeurecords.model.DigitalSignatures;
import org.manhdev.yeurecords.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DigitalSignatureRepository extends JpaRepository<DigitalSignatures, String> {
    void deleteByUser(User user);
    Optional<DigitalSignatures> findByUserId(String userId);
}