package org.manhdev.testcrudspringboot.mapper;

import org.manhdev.testcrudspringboot.dto.response.StatusMusicResponse;
import org.manhdev.testcrudspringboot.model.StatusMusic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StatusMusicMapper {
    @Mapping(target = "createdAt", expression = "java(statusMusic.getCreatedAt() != null ? statusMusic.getCreatedAt().toString() : null)")
    @Mapping(target = "updatedAt", expression = "java(statusMusic.getUpdatedAt() != null ? statusMusic.getUpdatedAt().toString() : null)")
    StatusMusicResponse toDto(StatusMusic statusMusic);
}
