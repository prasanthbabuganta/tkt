package com.example.thekingstemple.config;

import com.example.thekingstemple.util.TenantContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskDecorator;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration for async operations with tenant context propagation.
 * Ensures that tenant context is propagated from parent thread to async threads.
 */
@Configuration
@EnableAsync
@Slf4j
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.setTaskDecorator(new TenantAwareTaskDecorator());
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, params) -> {
            log.error("Uncaught async exception in method: {} with params: {}",
                    method.getName(), params, throwable);
        };
    }

    /**
     * Task decorator that captures tenant context from parent thread
     * and sets it in the async thread before task execution.
     */
    @Slf4j
    static class TenantAwareTaskDecorator implements TaskDecorator {
        @Override
        public Runnable decorate(Runnable runnable) {
            // Capture tenant context from current (parent) thread
            String tenantId = TenantContext.getTenantId();

            return () -> {
                try {
                    // Set tenant context in async thread
                    if (tenantId != null) {
                        TenantContext.setTenantId(tenantId);
                        log.debug("Propagated tenant context to async thread: {}", tenantId);
                    }

                    // Execute the actual task
                    runnable.run();
                } finally {
                    // Always clear tenant context after async task completes
                    TenantContext.clear();
                    log.debug("Cleared tenant context after async task completion");
                }
            };
        }
    }
}
