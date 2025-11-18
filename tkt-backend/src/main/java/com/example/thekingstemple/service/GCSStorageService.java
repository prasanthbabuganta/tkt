package com.example.thekingstemple.service;

import com.example.thekingstemple.util.TenantContext;
import com.google.cloud.storage.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Google Cloud Storage implementation of StorageService
 * Supports multi-tenancy with separate buckets per tenant
 */
@Service
@Profile("prod")
@RequiredArgsConstructor
@Slf4j
public class GCSStorageService implements StorageService {

    private final Storage storage;

    @Value("${storage.gcs.bucket-prefix:tkt-}")
    private String bucketPrefix;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/heic",
            "image/heif"
    );

    /**
     * Upload a file to GCS in a tenant-specific bucket and return the public URL
     *
     * @param file   The multipart file to upload
     * @param folder The folder path in the bucket (e.g., "vehicles/car" or "vehicles/key")
     * @return The public URL of the uploaded file
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

        // Get tenant-specific bucket name
        String bucketName = getTenantBucketName();
        log.debug("Using GCS bucket: {} for tenant: {}", bucketName, TenantContext.getTenantId());

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
            log.info("File uploaded successfully to bucket {}: {}", bucketName, uniqueFilename);

            // Return public URL
            return String.format("https://storage.googleapis.com/%s/%s", bucketName, uniqueFilename);
        } catch (Exception e) {
            log.error("Error uploading file to GCS bucket {}: {}", bucketName, e.getMessage(), e);
            throw new IOException("Failed to upload file to cloud storage", e);
        }
    }

    /**
     * Delete a file from GCS
     *
     * @param fileUrl The public URL of the file to delete
     * @return true if deletion was successful, false otherwise
     */
    @Override
    public boolean deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        try {
            // Extract bucket and blob name from URL
            // URL format: https://storage.googleapis.com/{bucket}/{blob-name}
            String urlPath = fileUrl.substring("https://storage.googleapis.com/".length());
            int firstSlash = urlPath.indexOf('/');

            if (firstSlash == -1) {
                log.error("Invalid GCS URL format: {}", fileUrl);
                return false;
            }

            String bucketName = urlPath.substring(0, firstSlash);
            String blobName = urlPath.substring(firstSlash + 1);

            BlobId blobId = BlobId.of(bucketName, blobName);
            boolean deleted = storage.delete(blobId);

            if (deleted) {
                log.info("File deleted successfully from bucket {}: {}", bucketName, blobName);
            } else {
                log.warn("File not found for deletion in bucket {}: {}", bucketName, blobName);
            }

            return deleted;
        } catch (Exception e) {
            log.error("Error deleting file from GCS: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Get the tenant-specific GCS bucket name
     * Format: {bucketPrefix}{tenantId}
     * Example: tkt-east, tkt-west, tkt-north, tkt-south
     */
    private String getTenantBucketName() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isEmpty()) {
            throw new IllegalStateException("Tenant context is not set. Cannot determine GCS bucket.");
        }
        return bucketPrefix + tenantId;
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
