package org.manhdev.testcrudspringboot.repository;

import org.manhdev.testcrudspringboot.model.License;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LicenseRepository extends JpaRepository<License, String> {
}
