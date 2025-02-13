package org.manhdev.testcrudspringboot.repository;

import org.manhdev.testcrudspringboot.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
    Set<Role> findByNameIn(Set<String> names);
}
