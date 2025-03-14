package org.manhdev.yeurecords.mapper;

import org.manhdev.yeurecords.dto.request.MusicRequest;
import org.manhdev.yeurecords.dto.response.MusicResponse;
import org.manhdev.yeurecords.model.Album;
import org.manhdev.yeurecords.model.Category;
import org.manhdev.yeurecords.model.Music;
import org.manhdev.yeurecords.model.User;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MusicMapper {
    @Mapping(source = "user.fullname", target = "fullName")
    @Mapping(source = "category.categoryName", target = "categoryName")
    @Mapping(source = "album.albumName", target = "albumName")
    @Mapping(source = "statusMusic.nameStatus", target = "statusMusic")
    @Mapping(target = "createdAt", expression = "java(music.getCreatedAt() != null ? music.getCreatedAt().toString() : null)")
    @Mapping(target = "updatedAt", expression = "java(music.getUpdatedAt() != null ? music.getUpdatedAt().toString() : null)")
    MusicResponse toResponse(Music music);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", expression = "java(category)")
    @Mapping(target = "user", expression = "java(user)")
    @Mapping(target = "album", expression = "java(album)")
    @Mapping(target = "licenses", ignore = true)
    Music toEntity(MusicRequest request, @Context User user, @Context Category category, @Context Album album);
}
