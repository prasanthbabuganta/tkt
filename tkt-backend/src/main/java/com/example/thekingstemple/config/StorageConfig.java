package com.example.thekingstemple.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

import java.io.IOException;

/**
 * Configuration for Google Cloud Storage
 */
@Configuration
@Slf4j
public class StorageConfig {

    @Value("${gcs.project-id:tkt-backend}")
    private String projectId;

    /**
     * Creates a Storage bean for interacting with Google Cloud Storage
     * Uses Application Default Credentials (ADC) for authentication
     */
    @Bean
    public Storage storage() throws IOException {
        log.info("Initializing Google Cloud Storage with project: {}", projectId);

        return StorageOptions.newBuilder()
                .setProjectId(projectId)
                .setCredentials(GoogleCredentials.getApplicationDefault())
                .build()
                .getService();
    }

    /**
     * Configure multipart file resolver for handling file uploads
     */
    @Bean
    public StandardServletMultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }
}
