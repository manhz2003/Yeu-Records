package org.manhdev.testcrudspringboot.repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.manhdev.testcrudspringboot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<User> findByEmail(String email);

    // Phương thức tìm tài khoản không kích hoạt theo trạng thái và ngày tạo
    List<User> findByActiveEmailFalseAndCreatedAtBefore(Date createdAt);

    boolean existsByPhoneAndIdNot(String phone, String userId);

    int countByStatusOnline(boolean b);

    int countByActiveEmail(boolean b);

    int countByStatus(int i);

    int countByCreatedAtAfter(Date createdAt);

    //    lấy danh sách nghệ sĩ có nhiều bản phát hành từ cao đến thấp
    @Query("""
    SELECT u.id AS id, u.fullname AS nameArtist, u.avatar AS avatar, COUNT(m.id) AS issuance
    FROM User u
    JOIN Music m ON u.id = m.user.id
    GROUP BY u.id, u.fullname, u.avatar
    ORDER BY issuance DESC
    """)
    List<Object[]> findFeaturedArtists();

    List<User> findAllByIdIn(List<String> ids);

    @Query("SELECT SUM(u.amountPayable) FROM User u")
    Double getTotalAmountPayable();
}
