package org.manhdev.yeurecords.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.manhdev.yeurecords.dto.request.CreateOrUpdateCategoryRequest;
import org.manhdev.yeurecords.dto.response.CategoryResponse;
import org.manhdev.yeurecords.model.Category;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    // Chuyển từ DTO sang Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "musics", ignore = true)
    Category toEntity(CreateOrUpdateCategoryRequest request);

    // Cập nhật thông tin từ DTO vào Entity đã tồn tại
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "musics", ignore = true)
    void updateCategoryFromRequest(CreateOrUpdateCategoryRequest request, @MappingTarget Category category);

    // Chuyển từ Entity sang Response
    @Mapping(target = "totalMusic", ignore = true)
    @Mapping(target = "createdAt", expression = "java(category.getCreatedAt() != null ? category.getCreatedAt().toString() : null)")
    @Mapping(target = "updatedAt", expression = "java(category.getUpdatedAt() != null ? category.getUpdatedAt().toString() : null)")
    CategoryResponse toResponse(Category category);
}
