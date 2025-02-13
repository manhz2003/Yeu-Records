package org.manhdev.testcrudspringboot.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.testcrudspringboot.dto.request.ApiResponse;
import org.manhdev.testcrudspringboot.dto.request.CreatePaymentInfoRequest;
import org.manhdev.testcrudspringboot.dto.response.PaymentInfoResponse;
import org.manhdev.testcrudspringboot.service.PaymentInfoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/payment-info")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentInfoController {
    PaymentInfoService paymentInfoService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentInfoResponse>> createOrUpdatePaymentInfo(@RequestBody CreatePaymentInfoRequest paymentInfoRequest) {
        PaymentInfoResponse response = paymentInfoService.createOrUpdatePaymentInfo(paymentInfoRequest);
        return ResponseEntity.ok(ApiResponse.<PaymentInfoResponse>builder()
                .code(200)
                .message("Payment info created or updated successfully")
                .result(response)
                .build());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<PaymentInfoResponse>> getPaymentInfoByUserId(@PathVariable String userId) {
            PaymentInfoResponse response = paymentInfoService.getPaymentInfoByUserId(userId);
            return ResponseEntity.ok(ApiResponse.<PaymentInfoResponse>builder()
                    .code(200)
                    .message("Payment info retrieved successfully")
                    .result(response)
                    .build());
    }

    @PatchMapping("/update-status")
    public ResponseEntity<ApiResponse<Void>> updatePaymentStatusForUsers(@RequestBody List<String> userIds) {
        paymentInfoService.updatePaymentStatusForUsers(userIds);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Payment status updated successfully")
                .build());
    }

}

