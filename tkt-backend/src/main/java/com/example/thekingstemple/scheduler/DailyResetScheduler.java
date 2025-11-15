package com.example.thekingstemple.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Scheduler for daily midnight tasks (IST timezone)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DailyResetScheduler {

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    /**
     * Runs every day at midnight IST
     * Cron format: second minute hour day month day-of-week
     * This cron expression runs at 00:00:00 IST every day
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Kolkata")
    public void performDailyMidnightTasks() {
        LocalDateTime now = LocalDateTime.now(IST_ZONE);
        log.info("🌙 Daily midnight reset started at: {}", now);

        try {
            // Task 1: Log the new day
            log.info("📅 New day: {}", now.toLocalDate());

            // Task 2: Clear any caches (if implemented)
            // cacheManager.clearAllCaches();

            // Task 3: Generate summary stats for previous day (optional)
            // reportService.generateDailySummary(now.toLocalDate().minusDays(1));

            // Task 4: Cleanup old audit logs (optional - keep last 90 days)
            // auditLogService.cleanupOldLogs(90);

            log.info("✅ Daily midnight reset completed successfully");
        } catch (Exception e) {
            log.error("❌ Error during daily midnight reset", e);
        }
    }

    /**
     * Optional: Health check scheduler - runs every hour
     */
    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Kolkata")
    public void hourlyHealthCheck() {
        LocalDateTime now = LocalDateTime.now(IST_ZONE);
        log.debug("⏰ Hourly health check at: {}", now);
        // Add health check logic here if needed
    }
}
