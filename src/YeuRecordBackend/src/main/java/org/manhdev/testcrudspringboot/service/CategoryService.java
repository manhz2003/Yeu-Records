package org.manhdev.testcrudspringboot.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.testcrudspringboot.constant.MessageConstant;
import org.manhdev.testcrudspringboot.dto.request.CreateOrUpdateCategoryRequest;
import org.manhdev.testcrudspringboot.dto.response.CategoryResponse;
import org.manhdev.testcrudspringboot.dto.response.StatisticsCategoryResponse;
import org.manhdev.testcrudspringboot.exception.ConflictException;
import org.manhdev.testcrudspringboot.exception.ResourceNotFoundException;
import org.manhdev.testcrudspringboot.mapper.CategoryMapper;
import org.manhdev.testcrudspringboot.model.Category;
import org.manhdev.testcrudspringboot.repository.AlbumRepository;
import org.manhdev.testcrudspringboot.repository.CategoryRepository;
import org.manhdev.testcrudspringboot.repository.MusicRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryService {
    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;
    AlbumRepository albumRepository;
    MusicRepository musicRepository;

    //    create category
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public CategoryResponse createCategory(CreateOrUpdateCategoryRequest request) {
        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new ConflictException(MessageConstant.NAME_CATEGORY_CONFLIG);
        }
        Category category = categoryMapper.toEntity(request);
        categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    //    tìm category theo id
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    private Category getCategoryById(String categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.CATEGORY_NOT_FOUND));
    }

    // Chuyển đổi Album thành AlbumResponse
    private CategoryResponse toCategoryResponse(Category category) {
        return categoryMapper.toResponse(category);
    }

    //    update category
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse updateCategoryById(String categoryId, CreateOrUpdateCategoryRequest request) {
        Category category = getCategoryById(categoryId);

        // Kiểm tra xem danh mục có trùng với danh mục khác hay không (loại trừ chính nó)
        boolean isDuplicate = categoryRepository.existsByCategoryName(request.getCategoryName()) &&
                !category.getCategoryName().equals(request.getCategoryName());

        if (isDuplicate) {
            throw new ConflictException(MessageConstant.NAME_CATEGORY_CONFLIG);
        }

        categoryMapper.updateCategoryFromRequest(request, category);
        Category updatedCategory = categoryRepository.save(category);
        return toCategoryResponse(updatedCategory);
    }


    //    delete category
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCategoryById (String categoryId) {
        getCategoryById(categoryId);
        categoryRepository.deleteById(categoryId);
    }

    //  lấy tất cả categories không phân trang
    public List<CategoryResponse> getAllCategoriesAsList() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(category -> {
                    int totalMusic = category.getMusics() != null ? category.getMusics().size() : 0;
                    CategoryResponse categoryResponse = categoryMapper.toResponse(category);
                    categoryResponse.setTotalMusic(totalMusic);
                    return categoryResponse;
                })
                .toList();
    }

    //  lấy tất cả categories có phân trang
    public Page<CategoryResponse> getAllCategoriesAsPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Category> categoryPage = categoryRepository.findAll(pageable);
        return categoryPage.map(category -> {
            int totalMusic = category.getMusics() != null ? category.getMusics().size() : 0;
            CategoryResponse categoryResponse = categoryMapper.toResponse(category);
            categoryResponse.setTotalMusic(totalMusic);
            return categoryResponse;
        });
    }


    // Thống kê category
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public StatisticsCategoryResponse getCategoryStatistics() {
        int totalCategory = (int) categoryRepository.count();
        int totalAlbum = (int) albumRepository.count();
        int unalbumedMusic = musicRepository.countByAlbumIsNull();

        // Lấy tổng số category tạo mới trong ngày
        Date today = new Date();
        int newCategoryToday = getNewCategoryToday(today);

        // Lấy tổng số album tạo mới trong ngày
        int newAlbumToday = getNewAlbumToday(today);

        // Trả về kết quả thống kê
        return StatisticsCategoryResponse.builder()
                .totalCategory(totalCategory)
                .totalAlbum(totalAlbum)
                .unalbumedMusic(unalbumedMusic)
                .newCategoryToday(newCategoryToday)
                .newAlbumToday(newAlbumToday)
                .build();
    }

    // Phương thức tách riêng để lấy startDate và endDate cho một ngày
    private Date[] getStartAndEndOfDay(Date today) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(today);

        // Đặt giờ, phút, giây, mili giây cho startDate (đầu ngày)
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startDate = calendar.getTime();

        // Đặt giờ, phút, giây, mili giây cho endDate (cuối ngày)
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        calendar.set(Calendar.MILLISECOND, 999);
        Date endDate = calendar.getTime();
        return new Date[]{startDate, endDate};
    }

    // Phương thức tính số album bị xóa trong ngày
    private int getNewCategoryToday(Date today) {
        Date[] dates = getStartAndEndOfDay(today);
        return categoryRepository.countNewCategory(dates[0], dates[1]);
    }

    // Phương thức tính số album tạo mới trong ngày
    private int getNewAlbumToday(Date today) {
        Date[] dates = getStartAndEndOfDay(today);
        return albumRepository.countNewAlbums(dates[0], dates[1]);
    }
}