package org.manhdev.yeurecords.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.manhdev.yeurecords.constant.MessageConstant;
import org.manhdev.yeurecords.constant.PaginationConstants;
import org.manhdev.yeurecords.dto.request.ApiResponse;
import org.manhdev.yeurecords.dto.request.CreateOrUpdateCategoryRequest;
import org.manhdev.yeurecords.dto.response.CategoryResponse;
import org.manhdev.yeurecords.dto.response.StatisticsCategoryResponse;
import org.manhdev.yeurecords.service.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {
    CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CreateOrUpdateCategoryRequest request) {
        CategoryResponse categoryResponse = categoryService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .result(categoryResponse)
                .code(200).message("Create category successfully").build());
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable String categoryId
            ,@Valid @RequestBody CreateOrUpdateCategoryRequest request) {
        CategoryResponse categoryResponse = categoryService.updateCategoryById(categoryId, request);
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .result(categoryResponse)
                .code(200).message("Update category successfully").build());
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> deleteCategory(@PathVariable String categoryId) {
        categoryService.deleteCategoryById(categoryId);
        return ResponseEntity.noContent().build();
    }

    // API lấy tất cả categories có phân trang
    @GetMapping
    public ResponseEntity<?> getAllCategories(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        // Nếu size == -1, lấy tất cả danh mục không phân trang
        if (size == -1) {
            List<CategoryResponse> categories = categoryService.getAllCategoriesAsList();
            return ResponseEntity.ok(categories);
        }

        if (size > PaginationConstants.MAX_PAGE_SIZE) {
            throw new IllegalArgumentException(
                    MessageConstant.MAX_SIZE_MESS + PaginationConstants.MAX_PAGE_SIZE);
        }

        // Trường hợp phân trang
        Page<CategoryResponse> categoryPage = categoryService.getAllCategoriesAsPage(page, size);
        return ResponseEntity.ok(categoryPage);
    }

    //  api thống kê category
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<StatisticsCategoryResponse>> getCategoryStatistics() {
        StatisticsCategoryResponse stats = categoryService.getCategoryStatistics();
        ApiResponse<StatisticsCategoryResponse> response = ApiResponse.<StatisticsCategoryResponse>builder()
                .code(200)
                .message("Category statistics retrieved successfully")
                .result(stats)
                .build();

        return ResponseEntity.ok(response);
    }

}
