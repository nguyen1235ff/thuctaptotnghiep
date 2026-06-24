package com.fooddelivery.service.impl;

import com.fooddelivery.dto.response.FileUploadResponse;
import com.fooddelivery.exception.BadRequestException;
import com.fooddelivery.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final Path uploadRoot;
    private final String baseUrl;

    public FileStorageServiceImpl(
            @Value("${app.upload.dir:uploads}") String uploadDir,
            @Value("${app.upload.base-url:/api/files}") String baseUrl) throws IOException {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.baseUrl = baseUrl;
        Files.createDirectories(this.uploadRoot);
    }

    @Override
    public FileUploadResponse store(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP, GIF)");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Kích thước file tối đa 5MB");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "image");
        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalName.substring(dotIndex);
        }

        String fileName = UUID.randomUUID() + extension;
        Path targetDir = uploadRoot.resolve(folder);
        Path targetPath = targetDir.resolve(fileName);

        try {
            Files.createDirectories(targetDir);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            log.error("Lỗi lưu file: {}", ex.getMessage());
            throw new BadRequestException("Không thể lưu file");
        }

        String fileUrl = baseUrl + "/" + folder + "/" + fileName;
        log.info("Upload file thành công: {}", fileUrl);

        return FileUploadResponse.builder()
                .fileName(fileName)
                .fileUrl(fileUrl)
                .fileSize(file.getSize())
                .build();
    }

    @Override
    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        String prefix = baseUrl + "/";
        if (!fileUrl.startsWith(prefix)) {
            return;
        }

        String relativePath = fileUrl.substring(prefix.length());
        Path filePath = uploadRoot.resolve(relativePath).normalize();

        if (!filePath.startsWith(uploadRoot)) {
            throw new BadRequestException("Đường dẫn file không hợp lệ");
        }

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.warn("Không thể xóa file: {}", fileUrl);
        }
    }
}
