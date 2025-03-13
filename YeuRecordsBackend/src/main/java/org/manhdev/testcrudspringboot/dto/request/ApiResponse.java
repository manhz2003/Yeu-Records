package org.manhdev.testcrudspringboot.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
// cho phép bạn tạo đối tượng ApiResponse<T> một cách linh hoạt
// mà không cần phải gọi trực tiếp các constructor.
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @Builder.Default
    private int code = 1000;
    private String message;
    private T result;
}
