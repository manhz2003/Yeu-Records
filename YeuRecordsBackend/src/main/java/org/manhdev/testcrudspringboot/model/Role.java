package org.manhdev.testcrudspringboot.model;

import java.util.Date;
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
public class Role {
    @Id
    String name;
    String description;

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

    @ManyToMany
    Set<Permission> permissions;
}
