package org.manhdev.yeurecords.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.manhdev.yeurecords.constant.MessageConstant;
import org.manhdev.yeurecords.constant.PredefinedRole;
import org.manhdev.yeurecords.dto.request.*;
import org.manhdev.yeurecords.dto.response.AuthenticationResponse;
import org.manhdev.yeurecords.dto.response.IntrospectResponse;
import org.manhdev.yeurecords.exception.AppException;
import org.manhdev.yeurecords.exception.ErrorCode;
import org.manhdev.yeurecords.exception.ResourceNotFoundException;
import org.manhdev.yeurecords.mapper.LoginSocialMapper;
import org.manhdev.yeurecords.model.InvalidatedToken;
import org.manhdev.yeurecords.model.Role;
import org.manhdev.yeurecords.model.User;
import org.manhdev.yeurecords.repository.InvalidatedTokenRepository;
import org.manhdev.yeurecords.repository.RoleRepository;
import org.manhdev.yeurecords.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    LoginSocialMapper loginSocialMapper;
    RoleRepository roleRepository;
    DigitalSignatureService digitalSignatureService;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String signerKey;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long validDuration;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long refreshableDuration;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token, false);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        // Xác thực thông tin người dùng
        var user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!authenticated) throw new AppException(ErrorCode.ACCOUNT_OR_PASS_INVALID);

        // Cập nhật trường logout thành 0
        user.setStatusOnline(true);
        userRepository.save(user);

        // Tạo access token mới
        var accessToken = generateToken(user);

        // Tạo refresh token mới (thời gian sống của refresh token được cấu hình bằng REFRESHABLE_DURATION)
        var refreshToken = generateRefreshToken(user);
        log.info("refreshToken đã làm mới: {}", refreshToken);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .authenticated(true)
                .build();
    }

    private String generateRefreshToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("manhdev")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(refreshableDuration, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("userId", user.getId())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create refresh token", e);
            throw new AppException(ErrorCode.TOKEN_GENERATION_FAILED);
        }
    }

    public ResponseEntity<ApiResponse<Void>> logout(LogoutRequest request)  {
        try {
            // Kiểm tra người dùng theo email để cập nhật trạng thái logout
            var user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));
            user.setStatusOnline(false);
            userRepository.save(user);

            // Xác thực token
            var signToken = verifyToken(request.getToken(), true);
            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            // Lưu token đã bị vô hiệu hóa
            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();
            invalidatedTokenRepository.save(invalidatedToken);

            // Trả về phản hồi thành công
            return ResponseEntity.noContent().build();

        } catch (AppException exception) {
            // Kiểm tra mã lỗi cụ thể từ exception
            if (exception.getErrorCode() == ErrorCode.RESOURCE_NOT_FOUND) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.<Void>builder().code(404).message(MessageConstant.USER_NOT_FOUND).build());
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.<Void>builder().code(401).message("Token đã hết hạn, không cần vô hiệu hóa lại").build());
            }
        } catch (Exception e) {
            log.error("Lỗi không xác định khi logout: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.<Void>builder().build());
        }
    }

    //    refresh token cho phép người dùng lấy lại quyền truy cập (access token) mà không cần đăng nhập lại
    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        // Kiểm tra tính hợp lệ của refresh token
        var signedJWT = verifyToken(request.getToken(), true);

        // Lấy thời gian phát hành của refresh token
        Date issueTime = signedJWT.getJWTClaimsSet().getIssueTime();

        // Tính toán thời gian hết hạn của refresh token dựa trên thời gian phát hành
        Date refreshTokenExpiryTime = Date.from(issueTime.toInstant().plus(refreshableDuration, ChronoUnit.SECONDS));

        // Kiểm tra nếu refresh token đã hết hạn
        if (new Date().after(refreshTokenExpiryTime)) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        // Refresh token hợp lệ, tiến hành tạo mới access token
        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        // Lưu token cũ vào bảng các token vô hiệu hóa
        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();
        invalidatedTokenRepository.save(invalidatedToken);

        // Trích xuất email của người dùng từ token
        var email = signedJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Tạo access token mới
        var newToken = generateToken(user);

        // Cập nhật token mới vào bảng User
        user.setToken(newToken);
        userRepository.save(user);

        // Trả về phản hồi
        return AuthenticationResponse.builder()
                .accessToken(newToken)
                .authenticated(true)
                .build();
    }

    public String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("manhdev")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(validDuration, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .claim("status", user.getStatus())
                .claim("activeEmail", user.isActiveEmail())
                .claim("avatar", user.getAvatar())
                .claim("roles", user.getRoles())
                .claim("fullname", user.getFullname())
                .claim("oauthProvider", user.getOauthProvider())
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            String token = jwsObject.serialize();

            // Lưu token vào User
            user.setToken(token);
            userRepository.save(user);

            return token;
        } catch (JOSEException e) {
            log.error("Cannot create access token", e);
            throw new AppException(ErrorCode.TOKEN_CREATION_FAILED);
        }
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(signerKey.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        // Kiểm tra thời gian hết hạn
        Date expiryTime = (isRefresh)
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime().toInstant()
                .plus(refreshableDuration, ChronoUnit.SECONDS).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        // Nếu token đã hết hạn, ném ra lỗi tương ứng
        if (!(verified && expiryTime.after(new Date()))) {
            if (isRefresh) {
                throw new AppException(ErrorCode.REFRESH_TOKEN_EXPIRED);
            } else {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
        }

        // Kiểm tra xem token có bị vô hiệu hóa không
        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return signedJWT;
    }

    // Xây dựng chuỗi phạm vi từ vai trò và quyền của người dùng để đưa vào token.
    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {

                //  ROLE_ để thêm tiền tố ROLE ở trước các role trong token, để phân biệt được với permission
                //  vì nó cùng được để trong scope
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
            });

        return stringJoiner.toString();
    }

    /**
     * login với mxh, nếu email đã tồn tại thì căn cứ vào nếu trường oauthProvider = system
     * thì thông báo 409 email đã tồn tại trong hệ thống, nếu oauthProvider = google thì thực
     * hiện update thông tin, nếu email chưa tồn tại thì tại mới user, chuyển token của mxh
     * thành token của hệ thống
     * */
    public ResponseEntity<ApiResponse<?>> handleSocialLogin(LoginSocialRequest request) {
        try {
            // Xác thực ID token với Firebase
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getOauthAccessToken());
            String email = decodedToken.getEmail();

            // Kiểm tra xem email đã tồn tại trong hệ thống hay chưa
            Optional<User> optionalUser = userRepository.findByEmail(email);
            User user;

            if (optionalUser.isPresent()) {
                user = optionalUser.get();

                // Kiểm tra trạng thái 'locked'
                if (user.getStatus() == 2) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.builder()
                                    .code(HttpStatus.FORBIDDEN.value())
                                    .message("Account is locked. Please contact support.")
                                    .build());
                }

                // Nếu oauthProvider là "system", từ chối ghi đè
                if ("system".equals(user.getOauthProvider())) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(ApiResponse.builder()
                                    .code(HttpStatus.CONFLICT.value())
                                    .message(request.getOauthProvider() + " account conflicts with an existing system email.")
                                    .build());
                }

                // Cập nhật thông tin người dùng từ nhà cung cấp mới nhất
                updateUserFromSocialProvider(user, request);
                user.setStatusOnline(true);
                userRepository.save(user);
            } else {
                // Tạo tài khoản mới nếu chưa tồn tại
                user = loginSocialMapper.toUser(request);
                user.setOauthProvider(request.getOauthProvider());

                HashSet<Role> roles = new HashSet<>();
                roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);
                user.setRoles(roles);
                user.setStatusOnline(true);

                // Lưu người dùng mới vào hệ thống
                userRepository.save(user);

                // Tạo chữ ký số cho người dùng mới
                digitalSignatureService.createDigitalSignature(user);
            }

            // Phát sinh JWT token cho người dùng
            String accessToken = generateToken(user);

            return ResponseEntity.ok(ApiResponse.<AuthenticationResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Login successful")
                    .result(AuthenticationResponse.builder()
                            .authenticated(true)
                            .accessToken(accessToken)
                            .build())
                    .build());

        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.builder()
                            .code(HttpStatus.UNAUTHORIZED.value())
                            .message(request.getOauthProvider() + " login failed: " + e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.builder()
                            .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                            .message("Unexpected error occurred: " + e.getMessage())
                            .build());
        }
    }


    // Phương thức cập nhật thông tin người dùng từ nhà cung cấp
    private void updateUserFromSocialProvider(User user, LoginSocialRequest request) {
        user.setAvatar(request.getAvatar());
        user.setPhone(request.getPhone());
        user.setFullname(request.getFullname());
        user.setOauthProviderId(request.getOauthProviderId());
        user.setOauthProvider(request.getOauthProvider());
        user.setActiveEmail(request.isActiveEmail());
    }


}
