package org.manhdev.yeurecords.model;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Set;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false, unique = true, length = 100)
    String email;
    String password;
    String fullname;
    String gender;
    LocalDate dob;

    @Column(length = 255)
    String address;

    @Column(columnDefinition = "TEXT")
    String avatar;

    @Column(length = 15, unique = true)
    String phone;

//    cột trạng thái, 0 là chưa xác thực, 1 là xác thực, 2 là khóa tài khoản
    int status;
    boolean statusOnline;
    boolean activeEmail;

    @Column(length = 6)
    String verificationCode;

    @Column(length = 50)
    String oauthProvider;

    @Column(length = 255)
    String oauthProviderId;

    @Column(columnDefinition = "TEXT")
    String token;

    @Builder.Default
    double amountPayable = 0;

    @Column(columnDefinition = "TEXT")
    String contactFacebook;

    @Column(columnDefinition = "TEXT")
    String contactInstagram;

    @Column(length = 255)
    String contactTelegram;

    @Column(columnDefinition = "TEXT")
    String digitalSpotify;

    @Column(columnDefinition = "TEXT")
    String digitalAppleMusic;

    @Column(columnDefinition = "TEXT")
    String digitalTiktok;

    @Temporal(TemporalType.TIMESTAMP)
    Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    Date updatedAt;

//    method tự động tạo thời gian create và update
    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }

//    sử dụng set để đảm bảo tính duy nhất của bản ghi
    @ManyToMany
    Set<Role> roles;

//    orphanRemoval giúp cho nếu payment info k thuộc về user nào nó sẽ bị xóa khỏi bảng
//    khi 1 user bị xóa, tất cả payment của user đó trong bảng paymentInfo cũng bị xóa
//    Quan hệ 1-N với PaymentInfo
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<PaymentInfo> paymentInfos;

    @OneToMany(mappedBy ="user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Album> albums;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Music> musics;

    @OneToMany(mappedBy ="user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<License> licenses;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<DigitalSignatures> digitalSignatures;
}
