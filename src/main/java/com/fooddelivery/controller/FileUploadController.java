package com.fooddelivery.controller;

import com.fooddelivery.dto.response.FileUploadResponse;
import com.fooddelivery.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/upload")
@AllArgsConstructor
@Tag(name = "Upload", description = "API upload ảnh")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/restaurants")
    @PreAuthorize("hasRole('RESTAURANT') or hasRole('ADMIN')")
    @Operation(summary = "Upload ảnh nhà hàng")
    public ResponseEntity<FileUploadResponse> uploadRestaurantImage(
            @RequestParam("file") MultipartFile file) {
        FileUploadResponse response = fileStorageService.store(file, "restaurants");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/foods")
    @PreAuthorize("hasRole('RESTAURANT') or hasRole('ADMIN')")
    @Operation(summary = "Upload ảnh món ăn")
    public ResponseEntity<FileUploadResponse> uploadFoodImage(
            @RequestParam("file") MultipartFile file) {
        FileUploadResponse response = fileStorageService.store(file, "foods");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/avatars")
    @Operation(summary = "Upload ảnh đại diện")
    public ResponseEntity<FileUploadResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file) {
        FileUploadResponse response = fileStorageService.store(file, "avatars");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
