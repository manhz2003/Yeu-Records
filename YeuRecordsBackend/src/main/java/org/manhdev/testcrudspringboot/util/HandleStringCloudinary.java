package org.manhdev.testcrudspringboot.util;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class HandleStringCloudinary {
    private HandleStringCloudinary() {
    }

    public static String getPublicIdFromUrl(String imageUrl) {
        String[] parts = imageUrl.split("/");

        // Kiểm tra và bỏ qua các phần version (ví dụ: v1734809033)
        boolean isUploadFound = false;
        StringBuilder publicId = new StringBuilder();

        for (String part : parts) {
            if (isUploadFound) {
                if (part.startsWith("v")) {
                    continue;
                }
                publicId.append(part).append("/");
            }
            if ("upload".equals(part)) {
                isUploadFound = true;
            }
        }

        if (!publicId.isEmpty() && publicId.charAt(publicId.length() - 1) == '/') {
            publicId.deleteCharAt(publicId.length() - 1);
        }

        log.info("Extracted publicId: {}", publicId);
        return publicId.toString();
    }

}
