package org.manhdev.testcrudspringboot.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

import jakarta.transaction.Transactional;
import org.manhdev.testcrudspringboot.constant.MessageConstant;
import org.manhdev.testcrudspringboot.constant.PredefinedRole;
import org.manhdev.testcrudspringboot.dto.request.*;
import org.manhdev.testcrudspringboot.dto.response.FeaturedArtistResponse;
import org.manhdev.testcrudspringboot.dto.response.UserListResponse;
import org.manhdev.testcrudspringboot.dto.response.UserResponse;
import org.manhdev.testcrudspringboot.exception.AppException;
import org.manhdev.testcrudspringboot.exception.ConflictException;
import org.manhdev.testcrudspringboot.exception.ErrorCode;
import org.manhdev.testcrudspringboot.exception.ResourceNotFoundException;
import org.manhdev.testcrudspringboot.mapper.UserMapper;
import org.manhdev.testcrudspringboot.model.Role;
import org.manhdev.testcrudspringboot.model.User;
import org.manhdev.testcrudspringboot.repository.MusicRepository;
import org.manhdev.testcrudspringboot.repository.RoleRepository;
import org.manhdev.testcrudspringboot.repository.UserRepository;
import org.manhdev.testcrudspringboot.util.UserAccessUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import static org.manhdev.testcrudspringboot.util.HandleStringCloudinary.getPublicIdFromUrl;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    MusicRepository musicRepository;
    CloudinaryService cloudinaryService;
    AuthenticationService authenticationService;
    DigitalSignatureService digitalSignatureService;

    //    create user
    public UserResponse createUser(UserCreationRequest request) {
        // Check for existing email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException(MessageConstant.EMAIL_CONFLIG + request.getEmail());
        }

        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException(MessageConstant.PHONE_CONFLIG);
        }

        // Create and save user
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);
        user.setRoles(roles);
        user = userRepository.save(user);

        // Generate and store digital signature for the new user
        digitalSignatureService.createDigitalSignature(user);

        // Return user response
        return userMapper.toUserResponse(user);
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    //    lấy thông tin user theo id
    public UserResponse getUserById(String id) {
        // Kiểm tra quyền truy cập của người dùng, id phải khớp id trong token của user đó
        UserAccessUtils.checkUserAccess(id);

        // Lấy user
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));

        // Đếm tổng số bài nhạc của user
        int totalMusic = musicRepository.countByUserId(id);

        // Chuyển đổi sang UserResponse và gán thêm trường totalMusic
        UserResponse response = userMapper.toUserResponse(user);
        response.setTotalMusic(totalMusic);
        return response;
    }

    //    update user
    public UserResponse updateUser(String userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));

        if (userRepository.existsByPhoneAndIdNot(request.getPhone(), userId)) {
            throw new ConflictException(MessageConstant.PHONE_CONFLIG);
        }

        // Nếu avatar thay đổi, kiểm tra và xóa ảnh cũ trên Cloudinary
        if (user.getAvatar() != null && !user.getAvatar().equals(request.getAvatar())) {
            String oldAvatarPublicId = getPublicIdFromUrl(user.getAvatar());

            try {
                cloudinaryService.deleteFile(oldAvatarPublicId, "raw");
            } catch (Exception e) {
                log.warn("Skipping Cloudinary deletion due to error: {}", e.getMessage());
            }
        }

        // Cập nhật thông tin user
        userMapper.updateUser(user, request);
        User updatedUser = userRepository.save(user);

        return userMapper.toUserResponse(updatedUser);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String id) {
        UserResponse user = getUserById(id);
        userRepository.deleteById(user.getId());
    }

    //    tìm user theo email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    //    lưu hoặc cập nhật thông tin user
    public void save(User user) {
        userRepository.save(user);
    }

    //    kiểm tra tài khoản không kích hoạt
    public List<User> findInactiveAccounts(Date cutoffDate) {
        List<User> inactiveUsers = userRepository.findByActiveEmailFalseAndCreatedAtBefore(cutoffDate);

        // Log để kiểm tra tài khoản không kích hoạt
        for (User user : inactiveUsers) {
            log.info("Tài khoản không kích hoạt: {}, createdAt: {}", user.getEmail(), user.getCreatedAt());
        }

        return inactiveUsers;
    }

    // Phương thức xóa các tài khoản không kích hoạt
    public void deleteInactiveAccounts(Date cutoffDate) {
        List<User> inactiveUsers = findInactiveAccounts(cutoffDate);
        log.info("Số tài khoản không kích hoạt tìm thấy: {}", inactiveUsers.size());

        if (!inactiveUsers.isEmpty()) {
            userRepository.deleteAll(inactiveUsers);
            log.info("Đã xóa {} tài khoản không được kích hoạt.", inactiveUsers.size());
        } else {
            log.info("Không có tài khoản nào bị xóa.");
        }
    }

    //    đổi mật khẩu
    public void changePassword(ChangePasswordRequest request) {
        // Lấy người dùng từ ID trong token
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));

        // Kiểm tra mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(request.getPasswordOld(), user.getPassword())) {
            throw new AppException(ErrorCode.OLD_PASSWORD_INCORRECT);
        }

        // Kiểm tra mật khẩu mới không được trùng với mật khẩu cũ
        if (passwordEncoder.matches(request.getPasswordNew(), user.getPassword())) {
            throw new AppException(ErrorCode.NEW_PASSWORD_SAME_AS_OLD);
        }

        // Mã hóa mật khẩu mới và lưu lại
        user.setPassword(passwordEncoder.encode(request.getPasswordNew()));
        userRepository.save(user);
    }

    //    get all data user, yêu cầu quyền admin hoặc nhân viên
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public UserListResponse getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // Lấy danh sách người dùng
        Page<User> users = userRepository.findAll(pageable);
        List<UserResponse> userResponses = convertToUserResponses(users);

        // Lấy thống kê
        int totalUser = (int) userRepository.count();
        int totalUserOnline = userRepository.countByStatusOnline(true);
        int totalUserNonActive = userRepository.countByActiveEmail(false);
        int totalAccountLocker = userRepository.countByStatus(2);
        int totalAccountNewToday = userRepository.countByCreatedAtAfter(getStartOfDay());

        // Tính tổng số tiền còn nợ
        Double totalAmountPayable = userRepository.getTotalAmountPayable();
        if (totalAmountPayable == null) {
            totalAmountPayable = 0.0; // Tránh null pointer
        }

        return UserListResponse.builder()
                .users(userResponses)
                .totalUser(totalUser)
                .totalUserOnline(totalUserOnline)
                .totalUserNonActive(totalUserNonActive)
                .totalAccountLocker(totalAccountLocker)
                .totalAccountNewToday(totalAccountNewToday)
                .totalAmountPayable(totalAmountPayable) // ✅ Thêm vào response
                .build();
    }

    private List<UserResponse> convertToUserResponses(Page<User> users) {
        return users.getContent().stream()
                .map(user -> {
                    // Sử dụng UserMapper để ánh xạ User -> UserResponse
                    UserResponse userResponse = userMapper.toUserResponse(user);

                    // Lấy tổng số bài nhạc từ MusicRepository
                    int totalMusic = musicRepository.countMusicsByUserId(user.getId());
                    userResponse.setTotalMusic(totalMusic);

                    return userResponse;
                })
                .toList();
    }

    private Date getStartOfDay() {
        LocalDateTime localDateTime = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    //    lấy danh sách nghệ sĩ có nhiều bản phát hành từ cao đến thấp
    public List<FeaturedArtistResponse> getListFeaturedArtist(int limit) {
        List<Object[]> results = userRepository.findFeaturedArtists();

        return results.stream()
                .limit(limit)
                .map(row -> new FeaturedArtistResponse(
                        (String) row[0],  // id
                        (String) row[1],  // nameArtist
                        (String) row[2],  // avatar
                        ((Number) row[3]).intValue() // issuance
                ))
                .toList();
    }

    //    cấp quyền cho tài khoản
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void grantRolesToUsers(GrantRolesRequest request) {
        // Lấy danh sách người dùng theo danh sách ID
        List<User> users = userRepository.findAllByIdIn(request.getUserIds());
        if (users.size() != request.getUserIds().size()) {
            throw new IllegalArgumentException(MessageConstant.ONE_OR_MORE_USER_NOT_EXIST);
        }

        // Lấy danh sách vai trò theo tên
        Set<Role> roles = roleRepository.findByNameIn(request.getRoles());
        if (roles.size() != request.getRoles().size()) {
            throw new IllegalArgumentException(MessageConstant.ONE_OR_MORE_ROLE_NOT_EXIST);
        }

        // Cập nhật quyền cho người dùng
        for (User user : users) {
            user.setRoles(new HashSet<>(roles));

            // Gọi hàm logout để vô hiệu hóa token hiện tại
            if (user.getToken() != null) {
                logoutUser(user);
            }
        }

        // Lưu danh sách người dùng đã cập nhật
        userRepository.saveAll(users);
    }

    // Hàm hỗ trợ logout để vô hiệu hóa token
    private void logoutUser(User user) {
        LogoutRequest logoutRequest = new LogoutRequest();
        logoutRequest.setEmail(user.getEmail());
        logoutRequest.setToken(user.getToken());

        try {
            // Gọi hàm logout từ AuthenticationService
            authenticationService.logout(logoutRequest);
        } catch (Exception e) {
            log.error("Failed to logout user {}: {}", user.getEmail(), e.getMessage());
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    //    khóa hoặc mở khóa tài khoản
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public String lockOrUnlockUserAccounts(UpdateLockStatusRequest request) {
        // Kiểm tra danh sách userId có tồn tại không
        List<User> users = userRepository.findAllByIdIn(request.getUserIds());
        if (users.size() != request.getUserIds().size()) {
            throw new IllegalArgumentException(MessageConstant.ONE_OR_MORE_USER_NOT_EXIST);
        }

        if (request.getStatus() == null) {
            throw new IllegalArgumentException(MessageConstant.INVALID_STATUS);
        }

        String actionMessage = switch (request.getStatus()) {
            case 1 -> "unlocked";
            case 2 -> "locked";
            default -> "undetermined";
        };

        for (User user : users) {
            user.setStatus(request.getStatus());
            if (request.getStatus() == 2 && user.getToken() != null) {
                // Nếu tài khoản bị khóa, vô hiệu hóa token hiện tại
                logoutUser(user);
            }
        }

        userRepository.saveAll(users);
        return actionMessage;
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public UserResponse updateAmountPayable(String userId, UpdateAmountRequest request) {
        // Lấy user từ DB
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));

        // Kiểm tra xem user có tài khoản thanh toán không
        if (user.getPaymentInfos() == null || user.getPaymentInfos().isEmpty()) {
            throw new AppException(ErrorCode.NO_PAYMENT_ACCOUNT);
        }

        // Kiểm tra và cập nhật giá trị amountPayable
        if (request.getAmountPayable() != null) {
            user.setAmountPayable(user.getAmountPayable() + request.getAmountPayable());
        } else if (request.getAmountPaid() != null) {
            user.setAmountPayable(user.getAmountPayable() - request.getAmountPaid());
        }

        // Lưu vào DB
        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

}
