package org.manhdev.testcrudspringboot.mapper;

import org.manhdev.testcrudspringboot.dto.response.DigitalSignatureResponse;
import org.manhdev.testcrudspringboot.model.DigitalSignatures;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DigitalSignatureMapper {
    @Mapping(target = "createdAt", expression = "java(digitalSignatures.getCreatedAt() != null ? digitalSignatures.getCreatedAt().toString() : null)")
    @Mapping(target = "updatedAt", expression = "java(digitalSignatures.getUpdatedAt() != null ? digitalSignatures.getUpdatedAt().toString() : null)")
    DigitalSignatureResponse toResponse (DigitalSignatures digitalSignatures);
}
