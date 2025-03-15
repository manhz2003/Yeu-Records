package org.manhdev.yeurecords.repository;

import org.manhdev.yeurecords.model.PaymentInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentInfoRepository extends JpaRepository<PaymentInfo, Long> {
    Optional<PaymentInfo> findByPaypalInfo(String paypalInfo);

    Optional<PaymentInfo> findByUserId(String userId);

    /** Mục đích của truy vấn này
     * Kiểm tra xung đột thông tin ngân hàng (bankCode và accountNumber) khi cập nhật hoặc tạo mới PaymentInfo.
     * Loại trừ chính người dùng hiện tại (userId) để tránh trường hợp trùng lặp thông tin do họ đang chỉnh sửa
     * thông tin thanh toán của mình.
     * */
    @Query("SELECT p FROM PaymentInfo p WHERE p.bankCode = :bankCode AND p.accountNumber = :accountNumber AND p.user.id != :userId")
    Optional<PaymentInfo> findConflict(@Param("bankCode") String bankCode,
                                       @Param("accountNumber") String accountNumber,
                                       @Param("userId") String userId);

}
