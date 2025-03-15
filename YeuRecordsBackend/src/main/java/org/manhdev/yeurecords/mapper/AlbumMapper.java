package org.manhdev.yeurecords.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.manhdev.yeurecords.dto.request.CreateOrUpdateAlbumRequest;
import org.manhdev.yeurecords.dto.response.AlbumResponse;
import org.manhdev.yeurecords.model.Album;

@Mapper(componentModel = "spring")
public interface AlbumMapper {
    // sử dụng thuộc tính source nếu dto và entity có cùng 1 trường nhưng khác tên
    // trường hợp này Chuyển từ CreateOrUpdateAlbumRequest sang Album. mà dto CreateOrUpdateAlbumRequest
    // có trường name còn entity album có trường là albumName. target = "albumName", source = "name" sẽ
    // giúp mapping chúng lại.
    @Mapping(target = "albumName", source = "name")
    Album toAlbum(CreateOrUpdateAlbumRequest request);

    // Chuyển từ Album sang AlbumResponse
    @Mapping(target = "name", source = "albumName")
    @Mapping(target = "createdAt", expression = "java(album.getCreatedAt() != null ? album.getCreatedAt().toString() : null)")
    @Mapping(target = "updatedAt", expression = "java(album.getUpdatedAt() != null ? album.getUpdatedAt().toString() : null)")
    AlbumResponse toAlbumResponse(Album album);

    // Cập nhật thông tin từ CreateOrUpdateAlbumRequest vào Album đã tồn tại
    @Mapping(target = "albumName", source = "name")
    void updateAlbumFromRequest(CreateOrUpdateAlbumRequest request, @MappingTarget Album album);
}
