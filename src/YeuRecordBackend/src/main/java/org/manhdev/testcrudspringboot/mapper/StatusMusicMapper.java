package org.manhdev.testcrudspringboot.mapper;

import org.manhdev.testcrudspringboot.model.StatusMusic;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StatusMusicMapper {

    StatusMusic toStatusMusic(StatusMusic statusMusic);

    StatusMusic fromStatusMusic(StatusMusic statusMusic);

}
