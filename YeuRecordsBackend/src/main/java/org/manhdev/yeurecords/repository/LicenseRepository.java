package org.manhdev.yeurecords.repository;

import org.manhdev.yeurecords.model.License;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LicenseRepository extends JpaRepository<License, String> {
}
