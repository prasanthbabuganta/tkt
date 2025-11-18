package com.example.thekingstemple.service;

import com.example.thekingstemple.util.TenantContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Local filesystem implementation of StorageService
 * Supports multi-tenancy with separate folders per tenant
 * Used for development and testing environments
 */
@Service
@Profile("dev")
@Slf4j
public class LocalStorageService implements StorageService {

    @Value("${storage.local.base-path:/Users/prasanthganta/resources/tkt}")
    private String basePath;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/heic",
            "image/heif"
    );

    /**
     * Upload a file to local filesystem in a tenant-specific folder and return the file path
     *
     * @param file   The multipart file to upload
     * @param folder The folder path (e.g., "vehicles/car" or "vehicles/key")
     * @return The local file path of the uploaded file
     * @throws IOException If upload fails
     */
    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    String.format("File size exceeds maximum allowed size of %d MB", MAX_FILE_SIZE / (1024 * 1024))
            );
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    String.format("Invalid file type. Allowed types: %s", String.join(", ", ALLOWED_CONTENT_TYPES))
            );
        }

        // Get tenant-specific directory path
        String tenantId = getTenantId();
        Path tenantFolderPath = Paths.get(basePath, tenantId, folder);

        // Create directories if they don't exist
        try {
            Files.createDirectories(tenantFolderPath);
            log.debug("Ensured directory exists: {}", tenantFolderPath);
        } catch (IOException e) {
            log.error("Failed to create directory: {}", tenantFolderPath, e);
            throw new IOException("Failed to create storage directory", e);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = String.format("%s-%s.%s",
                UUID.randomUUID().toString(),
                System.currentTimeMillis(),
                fileExtension
        );

        // Create full file path
        Path filePath = tenantFolderPath.resolve(uniqueFilename);

        // Save file to local filesystem
        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            log.info("File uploaded successfully to local storage: {}", filePath);

            // Return the absolute file path
            return filePath.toString();
        } catch (IOException e) {
            log.error("Error saving file to local storage: {}", e.getMessage(), e);
            throw new IOException("Failed to save file to local storage", e);
        }
    }

    /**
     * Delete a file from local filesystem
     *
     * @param fileUrl The file path to delete
     * @return true if deletion was successful, false otherwise
     */
    @Override
    public boolean deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        try {
            Path filePath = Paths.get(fileUrl);

            // Verify the file is within the allowed base path (security check)
            if (!filePath.startsWith(basePath)) {
                log.warn("Attempted to delete file outside base path: {}", fileUrl);
                return false;
            }

            boolean deleted = Files.deleteIfExists(filePath);

            if (deleted) {
                log.info("File deleted successfully from local storage: {}", fileUrl);
            } else {
                log.warn("File not found for deletion: {}", fileUrl);
            }

            return deleted;
        } catch (IOException e) {
            log.error("Error deleting file from local storage: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Get the current tenant ID from context
     */
    private String getTenantId() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isEmpty()) {
            throw new IllegalStateException("Tenant context is not set. Cannot determine storage folder.");
        }
        return tenantId;
    }

    /**
     * Extract file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg"; // default extension
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
