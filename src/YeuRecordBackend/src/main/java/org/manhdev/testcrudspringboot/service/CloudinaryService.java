package org.manhdev.testcrudspringboot.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
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

        // Gửi yêu cầu xóa file đến Cloudinary với resource_type là linh hoạt
        // nếu file ảnh resourceType là raw, pdf là image, mp3 là video
        // với ảnh resource_type là raw thì cần có đuôi mở rộng, còn với mp3 hay pdf thì k cần
        Map<String, Object> result = cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.asMap("resource_type", resourceType)
        );

        log.info("Cloudinary delete response: {}", result);
        return result;
    }
}
