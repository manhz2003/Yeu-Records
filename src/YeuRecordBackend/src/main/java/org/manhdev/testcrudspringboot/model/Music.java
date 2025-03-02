package org.manhdev.testcrudspringboot.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Music {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    Category category;

    @ManyToOne
    @JoinColumn(name = "status_music_id", nullable = false)
    StatusMusic statusMusic;

    @ManyToOne
    @JoinColumn(name = "album_id")
    Album album;

    String musicName;

    @Column(columnDefinition = "TEXT")
    String description;
    String fileFormat;

    @Column(columnDefinition = "TEXT")
    String musicUrl;

    @Column(columnDefinition = "TEXT")
    String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    String platformReleased;

    @Column(columnDefinition = "TEXT")
    String upc;

    @Column(columnDefinition = "TEXT")
    String isrc;

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

    @OneToMany(mappedBy = "music", cascade = CascadeType.ALL, orphanRemoval = true)
    List<License> licenses;
}
