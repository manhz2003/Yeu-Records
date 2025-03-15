package org.manhdev.yeurecords.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.manhdev.yeurecords.dto.request.CreatePaymentInfoRequest;
import org.manhdev.yeurecords.dto.response.PaymentInfoResponse;
import org.manhdev.yeurecords.model.PaymentInfo;

@Mapper(componentModel = "spring")
public interface PaymentInfoMapper {
    // Chuyển từ Request DTO sang Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    PaymentInfo toEntity(CreatePaymentInfoRequest request);

    // Chuyển từ Entity sang Response DTO
    @Mapping(target = "createdAt", expression = "java(paymentInfo.getCreatedAt().toString())")
    @Mapping(target = "updatedAt", expression = "java(paymentInfo.getUpdatedAt().toString())")
    PaymentInfoResponse toResponse(PaymentInfo paymentInfo);
}
