package org.manhdev.yeurecords.mapper;

import org.manhdev.yeurecords.dto.request.LoginSocialRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.manhdev.yeurecords.model.User;

@Mapper(componentModel = "spring")
public interface LoginSocialMapper {
    @Mapping(target = "id", ignore = true) // Không cần ID khi tạo mới
    @Mapping(target = "status", constant = "1") // Đặt trạng thái mặc định
    @Mapping(target = "roles", ignore = true)
    User toUser(LoginSocialRequest request);
}
