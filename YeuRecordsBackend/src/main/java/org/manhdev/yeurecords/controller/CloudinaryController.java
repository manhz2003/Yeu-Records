package org.manhdev.yeurecords.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.manhdev.yeurecords.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cloudinary")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CloudinaryController {

    CloudinaryService cloudinaryService;
    // Xóa file
    @DeleteMapping("/delete/{publicId}")
    public ResponseEntity<?> deleteFile(@PathVariable String publicId) {
        try {
            Map<String, Object> result = cloudinaryService.deleteFile(publicId, "raw");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting file: " + e.getMessage());
        }
    }
}
