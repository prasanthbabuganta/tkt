package com.example.thekingstemple.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Interface for storage service implementations
 * Supports multiple storage backends (GCS, local filesystem, etc.)
 */
public interface StorageService {

    /**
     * Upload a file and return the file URL/path
     *
     * @param file   The multipart file to upload
     * @param folder The folder path (e.g., "vehicles/car" or "vehicles/key")
     * @return The URL or path of the uploaded file
     * @throws IOException If upload fails
     */
    String uploadFile(MultipartFile file, String folder) throws IOException;

    /**
     * Delete a file
     *
     * @param fileUrl The URL or path of the file to delete
     * @return true if deletion was successful, false otherwise
     */
    boolean deleteFile(String fileUrl);
}
