package org.manhdev.yeurecords.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChangePasswordRequest {
    String userId;

    @Size(min = 6, message = "PASSWORD_INVALID")
    String passwordOld;

    @Size(min = 6, message = "PASSWORD_INVALID")
    String passwordNew;

}
