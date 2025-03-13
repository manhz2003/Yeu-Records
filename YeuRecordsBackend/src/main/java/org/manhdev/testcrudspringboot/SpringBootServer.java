package org.manhdev.testcrudspringboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication

// @ComponentScan dùng để Spring quét và nhận diện các bean được chỉ định trong package và
// các package con của nó, sau đó đưa vào Spring container. Mặc định, @SpringBootApplication
// đã tự động quét package nơi nó được định nghĩa và các package con. Khi sử dụng
// @ComponentScan, ta có thể chỉ định riêng khu vực cần quét, ví dụ:
// @ComponentScan("org.manhdev.testcrudspringboot.controller")

public class SpringBootServer {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootServer.class, args);
    }
}
