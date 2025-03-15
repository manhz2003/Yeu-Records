package org.manhdev.yeurecords.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CloudinaryService {
    Cloudinary cloudinary;

    // Xóa file với resource_type linh hoạt (image, video, raw...)
    public Map<String, Object> deleteFile(String publicId, String resourceType) throws IOException {
        log.info("Deleting file with publicId: {} and resourceType: {}", publicId, resourceType);

        if (publicId == null || publicId.trim().isEmpty()) {
            log.warn("Skipping delete: publicId is null or empty");
            return Collections.singletonMap("message", "Skipped delete: Invalid publicId");
        }

        try {
            Map<String, Object> result = cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", resourceType)
            );

            log.info("Cloudinary delete response: {}", result);
            return result;
        } catch (RuntimeException e) {
            log.error("Cloudinary delete failed: {}", e.getMessage());
            return Collections.singletonMap("error", "Cloudinary delete failed: " + e.getMessage());
        }
    }

}
