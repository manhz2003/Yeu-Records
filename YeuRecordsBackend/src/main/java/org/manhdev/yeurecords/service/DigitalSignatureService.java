package org.manhdev.yeurecords.service;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.yeurecords.constant.MessageConstant;
import org.manhdev.yeurecords.dto.response.DigitalSignatureResponse;
import org.manhdev.yeurecords.dto.response.SignatureVerificationResponse;
import org.manhdev.yeurecords.exception.DigitalSignatureException;
import org.manhdev.yeurecords.exception.ResourceNotFoundException;
import org.manhdev.yeurecords.mapper.DigitalSignatureMapper;
import org.manhdev.yeurecords.model.DigitalSignatures;
import org.manhdev.yeurecords.model.User;
import org.manhdev.yeurecords.repository.DigitalSignatureRepository;
import org.manhdev.yeurecords.util.UserAccessUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Date;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class DigitalSignatureService {
    DigitalSignatureRepository digitalSignatureRepository;
    DigitalSignatureMapper digitalSignatureMapper;

    public void createDigitalSignature(User user) {
        try {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
            keyGen.initialize(2048);
            KeyPair keyPair = keyGen.generateKeyPair();
            String privateKey = Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded());
            String publicKey = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());

            // Dữ liệu để ký chỉ bao gồm email
            String dataToSign = "Email: " + user.getEmail();

            // Tạo chữ ký số
            Signature rsaSignature = Signature.getInstance("SHA256withRSA");
            rsaSignature.initSign(keyPair.getPrivate());
            rsaSignature.update(dataToSign.getBytes());

            // Lưu chữ ký vào cơ sở dữ liệu
            byte[] signatureBytes = rsaSignature.sign();
            String digitalSignature = Base64.getEncoder().encodeToString(signatureBytes);

            DigitalSignatures signature = new DigitalSignatures();
            signature.setUser(user);
            signature.setPrivateKey(privateKey);
            signature.setPublicKey(publicKey);
            signature.setCertificate(user.getEmail());
            signature.setDigitalSignature(digitalSignature);
            signature.setCreatedAt(new Date());
            signature.setTimestamp(String.valueOf(LocalDateTime.now()));
            signature.setUpdatedAt(new Date());
            digitalSignatureRepository.save(signature);

        } catch (NoSuchAlgorithmException | SignatureException | InvalidKeyException e) {
            throw new DigitalSignatureException("Failed to generate digital signature", e);
        }
    }

    @Transactional
    public void deleteDigitalSignature(User user) {
        digitalSignatureRepository.deleteByUser(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public SignatureVerificationResponse verifyAndExtractDigitalSignature(String digitalSignature, String publicKey, User user) {
        try {
            String dataToVerify = "Email: " + user.getEmail();

            // Giải mã public key từ chuỗi Base64
            byte[] publicKeyBytes = Base64.getDecoder().decode(publicKey);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
            PublicKey decodedPublicKey = keyFactory.generatePublic(keySpec);

            // Giải mã chữ ký số từ chuỗi Base64
            byte[] signatureBytes = Base64.getDecoder().decode(digitalSignature);

            // Khởi tạo đối tượng Signature để xác thực
            Signature rsaSignature = Signature.getInstance("SHA256withRSA");
            rsaSignature.initVerify(decodedPublicKey);
            rsaSignature.update(dataToVerify.getBytes());

            // Xác thực chữ ký
            boolean isSignatureValid = rsaSignature.verify(signatureBytes);

            return SignatureVerificationResponse.builder()
                    .isSignatureValid(isSignatureValid)
                    .build();

        } catch (NoSuchAlgorithmException | InvalidKeyException | SignatureException | InvalidKeySpecException e) {
            throw new DigitalSignatureException("Failed to verify and extract digital signature", e);
        }
    }

    public DigitalSignatureResponse findByUserId(String userId) {
        UserAccessUtils.checkUserAccess(userId);
        DigitalSignatures digitalSignatures = digitalSignatureRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstant.USER_NOT_FOUND));
        return digitalSignatureMapper.toResponse(digitalSignatures);
    }


}
