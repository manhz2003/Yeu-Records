package org.manhdev.testcrudspringboot.util;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

public class UserAccessUtils {

    // Constructor private để ngăn việc tạo đối tượng của lớp
    private UserAccessUtils() {
        throw new UnsupportedOperationException("Lớp tiện ích không thể được khởi tạo");
    }

    public static void checkUserAccess(String id) {
        // Lấy Jwt từ SecurityContextHolder
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Lấy userId từ token
        String userIdFromToken = jwt.getClaimAsString("userId");

        // Lấy roles từ token
        List<Map<String, Object>> roles = jwt.getClaim("roles");

        // Kiểm tra nếu user có role ADMIN
        boolean isAdmin = roles != null && roles.stream()
                .anyMatch(role -> "ADMIN".equals(role.get("name")));

        // Nếu là ADMIN, không cần kiểm tra id, cho phép tất cả
        if (isAdmin) {
            return;
        }

        // Kiểm tra nếu userId từ token khớp với id trong URL
        if (userIdFromToken == null || !userIdFromToken.equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền truy cập");
        }
    }
}
