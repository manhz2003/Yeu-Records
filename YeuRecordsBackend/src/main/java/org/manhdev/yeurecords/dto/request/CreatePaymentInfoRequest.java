package org.manhdev.yeurecords.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreatePaymentInfoRequest {
    String userId;
    String bankName;
    String bankCode;
    String accountName;
    String accountNumber;
    String paypalInfo;
}