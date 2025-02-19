package org.manhdev.testcrudspringboot.controller;

import jakarta.validation.Valid;

import org.manhdev.testcrudspringboot.constant.MessageConstant;
import org.manhdev.testcrudspringboot.constant.PaginationConstants;
import org.manhdev.testcrudspringboot.dto.request.*;
import org.manhdev.testcrudspringboot.dto.response.FeaturedArtistResponse;
import org.manhdev.testcrudspringboot.dto.response.UserListResponse;
import org.manhdev.testcrudspringboot.dto.response.UserResponse;
import org.manhdev.testcrudspringboot.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder().code(200)
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @GetMapping("/{userId}")
    public UserResponse getUserById(@PathVariable("userId") String userId) {
        return userService.getUserById(userId);
    }

    @PutMapping("/{userId}")
    public UserResponse updateUser(
            @PathVariable("userId") String userId, @Valid @RequestBody UpdateUserRequest updateUserRequest) {
        return userService.updateUser(userId, updateUserRequest);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId") String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody @Valid ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Đổi mật khẩu thành công")
                .build());
    }

    //    get all data user phân trang
    @GetMapping
    public ApiResponse<UserListResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (size > PaginationConstants.MAX_PAGE_SIZE) {
            throw new IllegalArgumentException(
                    MessageConstant.MAX_SIZE_MESS + PaginationConstants.MAX_PAGE_SIZE);
        }

        UserListResponse userListResponse = userService.getAllUsers(page, size);
        return ApiResponse.<UserListResponse>builder()
                .code(200)
                .message("Success")
                .result(userListResponse)
                .build();
    }

    @GetMapping("/featured")
    public ApiResponse<List<FeaturedArtistResponse>> getListFeaturedArtist(@RequestParam(defaultValue = "4") int limit) {
        List<FeaturedArtistResponse> featuredArtistResponse = userService.getListFeaturedArtist(limit);
        return ApiResponse.<List<FeaturedArtistResponse>>builder()
                .code(200)
                .message("Success")
                .result(featuredArtistResponse)
                .build();
    }

    @PutMapping("/grant-roles")
    public ResponseEntity<ApiResponse<Void>> grantRolesToUsers(@RequestBody GrantRolesRequest request) {
            userService.grantRolesToUsers(request);
            ApiResponse<Void> response = ApiResponse.<Void>builder()
                    .code(200)
                    .message("Roles granted successfully")
                    .build();
            return ResponseEntity.ok(response);
    }

    // API để khóa hoặc mở khóa tài khoản
    @PutMapping("/lock-unlock")
    public ResponseEntity<ApiResponse<Void>> lockOrUnlockUserAccounts(@RequestBody @Valid UpdateLockStatusRequest request) {
        String actionMessage = userService.lockOrUnlockUserAccounts(request);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(200)
                .message(actionMessage)
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{userId}/amount")
    public ResponseEntity<UserResponse> updateAmountPayable(
            @PathVariable String userId,
            @RequestBody UpdateAmountRequest request) {
        return ResponseEntity.ok(userService.updateAmountPayable(userId, request));
    }
}
