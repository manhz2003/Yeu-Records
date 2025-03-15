package org.manhdev.yeurecords.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.yeurecords.dto.request.ApiResponse;
import org.manhdev.yeurecords.dto.request.CreatePaymentInfoRequest;
import org.manhdev.yeurecords.dto.response.PaymentInfoResponse;
import org.manhdev.yeurecords.service.PaymentInfoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

}

