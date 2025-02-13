package org.manhdev.testcrudspringboot.mapper;

import org.manhdev.testcrudspringboot.dto.request.LicenseRequest;
import org.manhdev.testcrudspringboot.dto.response.LicenseResponse;
import org.manhdev.testcrudspringboot.model.*;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LicenseMapper {

    @Mapping(source = "user.fullname", target = "fullName")
    @Mapping(source = "music.musicName", target = "musicName")
    @Mapping(target = "createdAt", expression = "java(license.getCreatedAt() != null ? license.getCreatedAt().toString() : null)")
    @Mapping(target = "updatedAt", expression = "java(license.getUpdatedAt() != null ? license.getUpdatedAt().toString() : null)")
    LicenseResponse toResponse(License license);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", expression = "java(user)")
    @Mapping(target = "music", expression = "java(music)")
    License toEntity(LicenseRequest request, @Context User user,  @Context Music music);
}
