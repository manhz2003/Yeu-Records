package org.manhdev.testcrudspringboot.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentInfoResponse {
    String id;
    String bankName;
    String bankCode;
    String accountName;
    String accountNumber;
    String paypalInfo;
    String paymentStatus;
    String createdAt;
    String updatedAt;
}
