package com.fooddelivery.service;

import com.fooddelivery.dto.response.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    FileUploadResponse store(MultipartFile file, String folder);
    void delete(String fileUrl);
}
