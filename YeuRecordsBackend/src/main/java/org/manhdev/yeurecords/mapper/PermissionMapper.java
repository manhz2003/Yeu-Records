package org.manhdev.yeurecords.mapper;

import org.manhdev.yeurecords.dto.request.PermissionRequest;
import org.manhdev.yeurecords.dto.response.PermissionResponse;
import org.manhdev.yeurecords.model.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);
    PermissionResponse toPermissionResponse(Permission permission);
}
