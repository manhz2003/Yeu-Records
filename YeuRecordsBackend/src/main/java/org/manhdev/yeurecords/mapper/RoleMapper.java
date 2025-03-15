package org.manhdev.yeurecords.mapper;

import org.manhdev.yeurecords.dto.request.RoleRequest;
import org.manhdev.yeurecords.dto.response.RoleResponse;
import org.manhdev.yeurecords.model.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);
    RoleResponse toRoleResponse(Role role);
}
