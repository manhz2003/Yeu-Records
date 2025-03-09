package org.manhdev.testcrudspringboot.controller;

import java.text.ParseException;
import jakarta.validation.Valid;
import org.manhdev.testcrudspringboot.dto.request.*;
import org.manhdev.testcrudspringboot.dto.response.AuthenticationResponse;
import org.manhdev.testcrudspringboot.dto.response.IntrospectResponse;
import org.manhdev.testcrudspringboot.exception.AppException;
import org.manhdev.testcrudspringboot.exception.ErrorCode;
import org.manhdev.testcrudspringboot.service.AuthenticationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nimbusds.jose.JOSEException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).message("Làm mới token thành công!").build();
    }

    //    comment nào mà đặt spotless:off thì thư viện format code sẽ bỏ qua đoạn code đấy
    //    và không tự động format, spotless:off là phần bắt đầu spotless:on là phần kết thúc

    //    spotless:off
    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }
    //    spotless:on

    // làm mới token
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refresh(@RequestBody RefreshRequest request) {
        try {
            var result = authenticationService.refreshToken(request);
            return ResponseEntity.ok(ApiResponse.<AuthenticationResponse>builder()
                    .result(result)
                    .build());
        } catch (AppException e) {
            if (e.getErrorCode() == ErrorCode.REFRESH_TOKEN_EXPIRED) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<AuthenticationResponse>builder()
                                .result(null)
                                .message("refresh token đã hết hạn")
                                .build());
            }

            // Nếu có lỗi khác, trả về 400 (hoặc mã lỗi khác tùy theo yêu cầu)
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<AuthenticationResponse>builder()
                            .result(null)
                            .message(e.getMessage())
                            .build());
        } catch (ParseException | JOSEException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<AuthenticationResponse>builder()
                            .result(null)
                            .message("token không hợp lệ")
                            .build());
        }
    }

    //    Đăng xuất giúp vô hiệu hóa token hoặc session đang hoạt động, ngăn chặn việc người khác lợi dụng
    //    thông tin đăng nhập cũ để truy cập trái phép vào hệ thống.
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody LogoutRequest request) {
        return authenticationService.logout(request);
    }

    @PostMapping("/google-login")
    public ResponseEntity<ApiResponse<?>> loginWithGoogle(@RequestBody @Valid LoginSocialRequest request) {
        return authenticationService.handleSocialLogin(request);
    }

    @PostMapping("/facebook-login")
    public ResponseEntity<ApiResponse<?>> loginWithFacebook(@RequestBody @Valid LoginSocialRequest request) {
        return authenticationService.handleSocialLogin(request);
    }


}
