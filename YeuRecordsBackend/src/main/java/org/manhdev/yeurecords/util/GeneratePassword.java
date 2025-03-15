package org.manhdev.yeurecords.util;

import java.util.Random;

public class GeneratePassword {

    // Constructor riêng tư để ngăn tạo đối tượng từ class này
    private GeneratePassword() {
        throw new UnsupportedOperationException("Utility class");
    }

    // Khai báo một đối tượng Random tĩnh để tái sử dụng
    private static final Random random = new Random();

    // Tạo mật khẩu ngẫu nhiên 8 ký tự bao gồm chữ viết hoa, chữ thường và số
    public static String generateRandomPassword() {
        // Tạo các tập ký tự cần thiết
        String upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Chữ viết hoa
        String lowerCase = "abcdefghijklmnopqrstuvwxyz"; // Chữ thường
        String digits = "0123456789"; // Chữ số
        StringBuilder password = new StringBuilder(8);

        // Đảm bảo mật khẩu có ít nhất một chữ viết hoa, một chữ thường và một số
        password.append(upperCase.charAt(random.nextInt(upperCase.length())));
        password.append(lowerCase.charAt(random.nextInt(lowerCase.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));

        // Tạo ra 5 ký tự ngẫu nhiên còn lại từ tập hợp tất cả các ký tự
        String allChars = upperCase + lowerCase + digits;
        for (int i = 0; i < 5; i++) {
            int randomIndex = random.nextInt(allChars.length());
            password.append(allChars.charAt(randomIndex));
        }

        // Xáo trộn mật khẩu để ngẫu nhiên hóa vị trí các ký tự
        return shuffleString(password.toString());
    }

    // Phương thức xáo trộn chuỗi
    private static String shuffleString(String input) {
        char[] characters = input.toCharArray();
        for (int i = 0; i < characters.length; i++) {
            int randomIndex = random.nextInt(characters.length);
            // Hoán đổi
            char temp = characters[i];
            characters[i] = characters[randomIndex];
            characters[randomIndex] = temp;
        }
        return new String(characters);
    }
}
