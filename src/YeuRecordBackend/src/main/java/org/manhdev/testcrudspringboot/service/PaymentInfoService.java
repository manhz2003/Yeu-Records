package org.manhdev.testcrudspringboot.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.testcrudspringboot.constant.MessageConstant;
import org.manhdev.testcrudspringboot.dto.request.CreatePaymentInfoRequest;
import org.manhdev.testcrudspringboot.dto.response.PaymentInfoResponse;
import org.manhdev.testcrudspringboot.exception.ConflictException;
import org.manhdev.testcrudspringboot.exception.ResourceNotFoundException;
import org.manhdev.testcrudspringboot.mapper.PaymentInfoMapper;
import org.manhdev.testcrudspringboot.model.PaymentInfo;
import org.manhdev.testcrudspringboot.model.User;
import org.manhdev.testcrudspringboot.repository.PaymentInfoRepository;
import org.manhdev.testcrudspringboot.repository.UserRepository;
import org.manhdev.testcrudspringboot.util.UserAccessUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentInfoService {
    PaymentInfoRepository paymentInfoRepository;
    UserRepository userRepository;
    PaymentInfoMapper paymentInfoMapper;

    /**
     * Tạo thông tin thanh toán hoặc cập nhật
     * Nếu người dùng chưa có thông tin thanh toán thì tạo mới, nếu có thì thực hiện cập nhật
     * Thông tin paypal không được phép trùng nhau, trừ khi nó rỗng hoặc null
     * Nếu người dùng khác nhau có cùng bank_code thì account_numbber không được trùng nhau,
     * trừ khi nó rỗng hoặc null
     */
    public PaymentInfoResponse createOrUpdatePaymentInfo(CreatePaymentInfoRequest request) {
        String userId = request.getUserId();

        // Kiểm tra quyền truy cập của người dùng, id phải khớp id trong token của user đó
        UserAccessUtils.checkUserAccess(userId);

        Optional<PaymentInfo> existingPaymentInfo = paymentInfoRepository.findByUserId(request.getUserId());

        if (existingPaymentInfo.isPresent()) {
            // Nếu người dùng đã có thông tin thanh toán, chỉ cần cập nhật
            PaymentInfo existingInfo = existingPaymentInfo.get();
            updatePaymentInfoIfNeeded(request, existingInfo);
            return paymentInfoMapper.toResponse(existingInfo);
        }

        // Nếu người dùng chưa có thông tin thanh toán, tạo mới
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));

        validateBankAccountAndPaypal(request, userId);
        PaymentInfo newPaymentInfo = createPaymentInfo(request, user);
        return paymentInfoMapper.toResponse(paymentInfoRepository.save(newPaymentInfo));
    }

    private void updatePaymentInfoIfNeeded(CreatePaymentInfoRequest request, PaymentInfo existingInfo) {
        String userId = request.getUserId();
        validateBankAccountAndPaypal(request, userId);

        // Cập nhật thông tin
        existingInfo.setBankName(request.getBankName());
        existingInfo.setBankCode(request.getBankCode());
        existingInfo.setAccountNumber(request.getAccountNumber());
        existingInfo.setAccountName(request.getAccountName());
        existingInfo.setPaypalInfo(request.getPaypalInfo());

        // Cập nhật thông tin User
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));
        existingInfo.setUser(user);

        // Lưu vào database
        paymentInfoRepository.save(existingInfo);
    }

    private PaymentInfo createPaymentInfo(CreatePaymentInfoRequest request, User user) {
        PaymentInfo paymentInfo = paymentInfoMapper.toEntity(request);
        paymentInfo.setUser(user);
        return paymentInfo;
    }

    private void validateBankAccountAndPaypal(CreatePaymentInfoRequest request, String userId) {
        // Kiểm tra sự trùng lặp giữa bankCode và accountNumber
        if (request.getAccountNumber() != null && !request.getAccountNumber().isEmpty()
                && request.getBankCode() != null && !request.getBankCode().isEmpty()) {
            checkBankAccountConflict(request.getBankCode(), request.getAccountNumber(), userId);
        }

        // Kiểm tra sự trùng lặp với paypalInfo
        if (request.getPaypalInfo() != null && !request.getPaypalInfo().isEmpty()) {
            checkPaypalConflict(request.getPaypalInfo(), userId); // Thêm userId vào đây
        }
    }

    private void checkBankAccountConflict(String bankCode, String accountNumber, String userId) {
        Optional<PaymentInfo> conflictingPaymentInfo = paymentInfoRepository.findConflict(bankCode, accountNumber, userId);
        if (conflictingPaymentInfo.isPresent()) {
            throw new ConflictException("Số tài khoản đã tồn tại trong ngân hàng này.");
        }
    }

    private void checkPaypalConflict(String paypalInfo, String userId) {
        Optional<PaymentInfo> conflictingInfo = paymentInfoRepository.findByPaypalInfo(paypalInfo);

        conflictingInfo.ifPresent(info -> {
            // Nếu thông tin PayPal đã tồn tại nhưng là của chính người dùng hiện tại, không coi là xung đột
            if (!info.getUser().getId().equals(userId)) {
                throw new ConflictException("Paypal information đã tồn tại.");
            }
        });
    }

    //    lấy thông tin tài khoản theo id user
    public PaymentInfoResponse getPaymentInfoByUserId(String userId) {
        UserAccessUtils.checkUserAccess(userId);
        PaymentInfo paymentInfo = paymentInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));
        return paymentInfoMapper.toResponse(paymentInfo);
    }


    /**
     * Cập nhật trạng thái thanh toán cho 1 hoặc nhiều userId.
     * Nếu trạng thái thanh toán cần chuyển thành true trong tháng hiện tại hoặc false nếu đã sang tháng mới.
     *
     * @param userIds Danh sách các userId cần cập nhật trạng thái thanh toán
     */

    @PreAuthorize("hasRole('ADMIN')")
    public void updatePaymentStatusForUsers(List<String> userIds) {
        for (String userId : userIds) {
            // Kiểm tra quyền truy cập của người dùng
            UserAccessUtils.checkUserAccess(userId);

            // Lấy thông tin thanh toán của người dùng
            Optional<PaymentInfo> paymentInfoOptional = paymentInfoRepository.findByUserId(userId);

            PaymentInfo paymentInfo = paymentInfoOptional
                    .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND + ".. " + userId));

            // Cập nhật trạng thái thanh toán dựa trên thời gian
            paymentInfo.setPaymentStatus(isSameMonth(paymentInfo.getCreatedAt()));

            // Lưu lại thông tin thanh toán đã cập nhật
            paymentInfoRepository.save(paymentInfo);
        }
    }

    /**
     * Kiểm tra xem ngày trong `createdAt` có thuộc tháng hiện tại hay không.
     *
     * @param createdAt Ngày tạo của thông tin thanh toán
     * @return true nếu trong cùng tháng, false nếu không
     */

    private boolean isSameMonth(Date createdAt) {
        // Chuyển đổi Date thành LocalDate
        LocalDate createdAtLocalDate = createdAt.toInstant()
                .atZone(java.time.ZoneId.systemDefault())
                .toLocalDate();
        LocalDate now = LocalDate.now();
        return createdAtLocalDate.getMonth() == now.getMonth() && createdAtLocalDate.getYear() == now.getYear();
    }
}
