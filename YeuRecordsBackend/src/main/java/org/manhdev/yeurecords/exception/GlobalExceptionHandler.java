package org.manhdev.yeurecords.exception;

import java.security.NoSuchAlgorithmException;
import java.util.Map;

import jakarta.validation.ConstraintViolation;

import org.manhdev.yeurecords.dto.request.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final String MIN_ATTRIBUTE = "min";

    //    nếu ngoại lệ sảy ra không thuộc các ngoại lệ đã cấu hình bên dưới thì bắt vào đây
    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<String>> handlingRuntimeException() {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    //    App Exception (đây là exception tùy chỉnh), xử dụng khi chưa xác định được chính xác lỗi là gì
//    hoặc muốn trả về mã và nội dung lỗi tùy chỉnh
    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<String>> handlingAppException(AppException appException) {
        ErrorCode errorCode = appException.getErrorCode();
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    //    Ngoại lệ được ném ra khi dữ liệu không hợp lệ được gửi trong yêu cầu HTTP.
//    ví dụ khi dùng @NotNull, @Size, @Email, v.v., và giá trị không thỏa mãn các điều kiện
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<String>> handleValidationAndException(MethodArgumentNotValidException exception) {
        // Lấy thông điệp lỗi từ FieldError
        String errorMessage = exception.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        Map<String, Object> attributes = null;

        try {
            // Nếu thông điệp là một enum key, ánh xạ sang ErrorCode
            errorCode = ErrorCode.valueOf(errorMessage);

            // Nếu lỗi liên quan đến ConstraintViolation, lấy attributes
            var constraintViolation = exception.getBindingResult()
                    .getAllErrors()
                    .get(0)
                    .unwrap(ConstraintViolation.class);

            attributes = constraintViolation.getConstraintDescriptor().getAttributes();
            errorMessage = mapAttribute(errorCode.getMessage(), attributes); // Ánh xạ thông điệp với attributes
        } catch (IllegalArgumentException e) {
            // Nếu không phải enum key, giữ nguyên thông điệp từ ràng buộc
        } catch (Exception e) {
            // Bắt lỗi nếu unwrap thất bại
            errorMessage = exception.getFieldError().getDefaultMessage();
        }

        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorMessage);

        return ResponseEntity.badRequest().body(apiResponse);
    }

    private String mapAttribute(String message, Map<String, Object> attributes) {
        String minValue = String.valueOf(attributes.get(MIN_ATTRIBUTE));
        return message.replace("{" + MIN_ATTRIBUTE + "}", minValue);
    }

    //   ngoại lệ khi không có quyền truy cập
    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse<?>> handlingAccessDeniedException() {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    //  ngoại lệ khi người dùng chọn sai method http
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<String>> handleHttpRequestMethodNotSupported() {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.RESOURCE_NOT_ALLOWED.getCode());
        apiResponse.setMessage(ErrorCode.RESOURCE_NOT_ALLOWED.getMessage());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(apiResponse);
    }

    //    ngoại lệ khi nhập sai endpoint
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<String>> handleNotFoundException() {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.ENDPOINT_NOT_FOUND.getCode());
        apiResponse.setMessage(ErrorCode.ENDPOINT_NOT_FOUND.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiResponse);
    }

    //    ngoại lệ dành cho 404 không tìm thấy tài nguyên
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<String>> handleResourceNotFound(ResourceNotFoundException exception) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.RESOURCE_NOT_FOUND.getCode());
        apiResponse.setMessage(exception.getMessage() != null ? exception.getMessage() : ErrorCode.RESOURCE_NOT_FOUND.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiResponse);
    }

    //    ngoại lệ dành cho 409 tài nguyên trùng lặp đã tồn tại
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<String>> handleConflictException(ConflictException exception) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.RESOURCE_CONFLICT.getCode());
        apiResponse.setMessage(exception.getMessage() != null ? exception.getMessage() : ErrorCode.RESOURCE_CONFLICT.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(apiResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<String>> handleIllegalArgumentException(IllegalArgumentException exception) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setCode(400);
        apiResponse.setMessage(exception.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    // Bắt tất cả các exception loại UnsupportedOperationException
    @ExceptionHandler(UnsupportedOperationException.class)
    public ResponseEntity<ApiResponse<String>> handleResponseStatus(UnsupportedOperationException ex) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setCode(400);
        apiResponse.setMessage(ex.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<String>> handleResponseStatusException(ResponseStatusException ex) {
        // Tạo đối tượng ApiResponse để chứa mã và thông báo lỗi
        ApiResponse<String> apiResponse = new ApiResponse<>();

        // Đặt mã lỗi HTTP và thông báo từ ngoại lệ
        apiResponse.setCode(ex.getStatusCode().value());
        apiResponse.setMessage(ex.getReason());

        // Trả về ResponseEntity với mã lỗi và thông báo
        return ResponseEntity.status(ex.getStatusCode()).body(apiResponse);
    }

    // Xử lý ngoại lệ NoSuchAlgorithmException
    @ExceptionHandler(NoSuchAlgorithmException.class)
    public ResponseEntity<ApiResponse<String>> handleNoSuchAlgorithmException(NoSuchAlgorithmException ex) {
        ApiResponse<String> response = ApiResponse.<String>builder()
                .code(500)
                .message("Algorithm not found: " + ex.getMessage())
                .result(null)
                .build();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
