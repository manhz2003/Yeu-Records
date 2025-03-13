package org.manhdev.testcrudspringboot.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.manhdev.testcrudspringboot.dto.request.ApiResponse;
import org.manhdev.testcrudspringboot.dto.request.SignatureVerificationRequest;
import org.manhdev.testcrudspringboot.dto.response.DigitalSignatureResponse;
import org.manhdev.testcrudspringboot.dto.response.SignatureVerificationResponse;
import org.manhdev.testcrudspringboot.service.DigitalSignatureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/digital-signature")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DigitalSignatureController {
    DigitalSignatureService digitalSignatureService;

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<SignatureVerificationResponse>> verifySignature(@RequestBody SignatureVerificationRequest request) {
        SignatureVerificationResponse verificationResponse = digitalSignatureService.verifyAndExtractDigitalSignature(
                request.getDigitalSignature(),
                request.getPublicKey(),
                request.getUser()
        );

        return ResponseEntity.ok(ApiResponse.<SignatureVerificationResponse>builder()
                .message("Signature verification completed successfully")
                .code(200)
                .result(verificationResponse)
                .build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<DigitalSignatureResponse>> getDigitalSignatureByUserId(@PathVariable String userId) {
        DigitalSignatureResponse signature = digitalSignatureService.findByUserId(userId);
        return ResponseEntity.ok(ApiResponse.<DigitalSignatureResponse>builder()
                .message("Digital signature retrieved successfully")
                .code(200)
                .result(signature)
                .build());
    }



}
