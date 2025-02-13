package org.manhdev.testcrudspringboot.mapper;

import org.manhdev.testcrudspringboot.dto.request.UpdateUserRequest;
import org.manhdev.testcrudspringboot.dto.request.UserCreationRequest;
import org.manhdev.testcrudspringboot.dto.response.UserResponse;
import org.manhdev.testcrudspringboot.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

// sử dụng mapper để mapping data giữa dto và model
// ví dụ cùng sử dụng 1 dto response để trả về kết quả nhưng các trường trả về khác nhau
// thì sẽ viết các hàm tương ứng ở trong mapper tránh phải tạo nhiều dto khác.
@Mapper(componentModel = "spring", uses = {PaymentInfoMapper.class})
public interface UserMapper {

    User toUser(UserCreationRequest request);

    @Mapping(target = "paymentInfos", source = "paymentInfos")
    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UpdateUserRequest request);
}

