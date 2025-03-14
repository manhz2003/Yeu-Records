package org.manhdev.yeurecords.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.manhdev.yeurecords.dto.response.StatusMusicResponse;
import org.manhdev.yeurecords.mapper.StatusMusicMapper;
import org.manhdev.yeurecords.repository.StatusMusicRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatusMusicService {
    StatusMusicRepository statusMusicRepository;
    StatusMusicMapper statusMusicMapper;

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public List<StatusMusicResponse> getAllStatusMusic() {
        return statusMusicRepository.findAll()
                .stream()
                .map(statusMusicMapper::toDto)
                .toList();
    }
}
