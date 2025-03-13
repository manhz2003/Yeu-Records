package org.manhdev.testcrudspringboot.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GrantRolesRequest {
    private List<String> userIds;
    private Set<String> roles;
}
