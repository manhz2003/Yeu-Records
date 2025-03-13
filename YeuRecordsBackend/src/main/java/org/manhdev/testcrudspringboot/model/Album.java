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
public class Album {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    String albumName;

    @Column(columnDefinition = "TEXT")
    String thumbnailUrl;

    @Temporal(TemporalType.TIMESTAMP)
    Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    Date updatedAt;

    @Temporal(TemporalType.TIMESTAMP)
    Date deletedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }

    @OneToMany(mappedBy = "album")
    List<Music> musics;

    @PreRemove
    private void preRemove() {
        if (musics != null) {
            musics.forEach(music -> music.setAlbum(null));
        }
    }

}
