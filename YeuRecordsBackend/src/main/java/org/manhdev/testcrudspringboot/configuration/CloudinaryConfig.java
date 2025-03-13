package org.manhdev.testcrudspringboot.configuration;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dvir2hzdf",
                "api_key", "866179895797895",
                "api_secret", "PAxfIoHcccnsRH756lBqcFqH1VA"
        ));
    }
}
