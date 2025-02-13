package org.manhdev.testcrudspringboot.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateOrUpdateCategoryRequest {
    @NotBlank(message = "category name is required")
    String categoryName;

    @NotBlank(message = "description is required")
    String description;
}
