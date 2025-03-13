package org.manhdev.testcrudspringboot.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class DigitalSignatures {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(columnDefinition = "TEXT")
    String digitalSignature;

    @Column(columnDefinition = "TEXT")
    String privateKey;

    @Column(columnDefinition = "TEXT")
    String publicKey;

    @Column(columnDefinition = "TEXT")
    String certificate;

    @Column(name = "timestamp", nullable = false)
    String timestamp;

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
