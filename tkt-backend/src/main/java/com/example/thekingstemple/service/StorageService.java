package com.example.thekingstemple.service;

import com.google.cloud.storage.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling file uploads to Google Cloud Storage
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private final Storage storage;

    @Value("${gcs.bucket-name:tkt-vehicle-photos}")
    private String bucketName;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/heic",
            "image/heif"
    );

    /**
     * Upload a file to GCS and return the public URL
     *
     * @param file     The multipart file to upload
     * @param folder   The folder path in the bucket (e.g., "vehicles/car" or "vehicles/key")
     * @return The public URL of the uploaded file
     * @throws IOException If upload fails
     */
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

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = String.format("%s/%s-%s.%s",
                folder,
                UUID.randomUUID().toString(),
                System.currentTimeMillis(),
                fileExtension
        );

        // Create BlobId and BlobInfo
        BlobId blobId = BlobId.of(bucketName, uniqueFilename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(contentType)
                .build();

        // Upload file to GCS
        try {
            Blob blob = storage.create(blobInfo, file.getBytes());
            log.info("File uploaded successfully: {}", uniqueFilename);

            // Return public URL
            return String.format("https://storage.googleapis.com/%s/%s", bucketName, uniqueFilename);
        } catch (Exception e) {
            log.error("Error uploading file to GCS: {}", e.getMessage(), e);
            throw new IOException("Failed to upload file to cloud storage", e);
        }
    }

    /**
     * Delete a file from GCS
     *
     * @param fileUrl The public URL of the file to delete
     * @return true if deletion was successful, false otherwise
     */
    public boolean deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        try {
            // Extract blob name from URL
            // URL format: https://storage.googleapis.com/{bucket}/{blob-name}
            String blobName = fileUrl.substring(fileUrl.indexOf(bucketName) + bucketName.length() + 1);

            BlobId blobId = BlobId.of(bucketName, blobName);
            boolean deleted = storage.delete(blobId);

            if (deleted) {
                log.info("File deleted successfully: {}", blobName);
            } else {
                log.warn("File not found for deletion: {}", blobName);
            }

            return deleted;
        } catch (Exception e) {
            log.error("Error deleting file from GCS: {}", e.getMessage(), e);
            return false;
        }
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
