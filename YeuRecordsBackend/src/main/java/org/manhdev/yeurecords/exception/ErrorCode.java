package org.manhdev.yeurecords.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
//    những error code bắt bằng appException
    USER_ID_EMPTY(400, "chua truyen id user", HttpStatus.BAD_REQUEST),
    INVALID_KEY(400, "key không hợp lệ", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(400, "username phai du {min} ky tu tro len", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(400, "password phai du {min} ky tu tro len", HttpStatus.BAD_REQUEST),
    PASSWORD_NULL_OR_EMPTY(400, "chưa nhập id", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(400, "email chưa đúng định dạng", HttpStatus.BAD_REQUEST),
    INVALID_DOB(400, "Tuổi của bạn phải ít nhất là {min}", HttpStatus.BAD_REQUEST),
    PHONE_INVALID(400, "Số điện thoại gồm 10 ký tự, từ 0 - 9", HttpStatus.BAD_REQUEST),
    REFRESH_TOKEN_EXPIRED(401, "refresh token hết hạn, hãy đăng nhập lại", HttpStatus.UNAUTHORIZED),
    OLD_PASSWORD_INCORRECT(400, "Mật khẩu cũ không chính xác", HttpStatus.BAD_REQUEST),
    NEW_PASSWORD_SAME_AS_OLD(400, "Mật khẩu mới không được trùng với mật khẩu cũ", HttpStatus.BAD_REQUEST),
    INTERNAL_SERVER_ERROR(500, "Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR),
    ACCOUNT_OR_PASS_INVALID(400, "Tài khoản hoặc mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    TOKEN_GENERATION_FAILED(500, "Lỗi khi tạo refresh token", HttpStatus.INTERNAL_SERVER_ERROR),
    TOKEN_VERIFICATION_FAILED(401, "Token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    TOKEN_CREATION_FAILED(500, "Lỗi khi tạo access token", HttpStatus.INTERNAL_SERVER_ERROR),


//    những error code bắt bằng exception custom hoặc của hệ thống
    UNCATEGORIZED_EXCEPTION(500, "ngoại lệ chưa được phân loại", HttpStatus.INTERNAL_SERVER_ERROR),
    RESOURCE_NOT_ALLOWED(405, "Không được phép truy cập tài nguyên", HttpStatus.METHOD_NOT_ALLOWED),
    RESOURCE_NOT_FOUND(404, "tài nguyên không tồn tại", HttpStatus.NOT_FOUND),
    RESOURCE_CONFLICT(409, "xung đột tài nguyên trùng lặp", HttpStatus.CONFLICT),
    UNAUTHENTICATED(401, "token không hợp lệ", HttpStatus.UNAUTHORIZED),
    ENDPOINT_NOT_FOUND(404, "endpoint không hợp lệ", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(403, "user không có quyền truy cập", HttpStatus.FORBIDDEN),
    NO_PAYMENT_ACCOUNT(422, "Người dùng chưa có tài khoản thanh toán", HttpStatus.UNPROCESSABLE_ENTITY),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
