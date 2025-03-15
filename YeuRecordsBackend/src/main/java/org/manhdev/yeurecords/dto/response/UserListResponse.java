package org.manhdev.yeurecords.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserListResponse {
//    trả thông tin user kèm thống kê cho trang quản lý user
    List<UserResponse> users;
    int totalUser;
    int totalUserOnline;
    int totalUserNonActive;
    int totalAccountLocker;
    int totalAccountNewToday;
    double totalAmountPayable;
}
