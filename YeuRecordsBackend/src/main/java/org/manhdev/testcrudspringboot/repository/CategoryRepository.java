package org.manhdev.testcrudspringboot.repository;

import org.manhdev.testcrudspringboot.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    boolean existsByCategoryName(String categoryName);

    @Query("SELECT COUNT(a) FROM Category a WHERE a.createdAt BETWEEN :startDate AND :endDate")
    int countNewCategory(Date startDate, Date endDate);
}
