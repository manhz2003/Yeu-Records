package org.manhdev.yeurecords.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.Date;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class PaymentInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    // Khóa ngoại trỏ tới User
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    String bankName;
    String bankCode;
    String accountName;
    String accountNumber;
    String paypalInfo;

    @Temporal(TemporalType.TIMESTAMP)
    Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    Date updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }
}
