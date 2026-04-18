package com.authcore.unifolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for the UniFolio application.
 *
 * @EnableJpaAuditing  — activates @CreatedDate and @LastModifiedDate
 *                       on all entities that use AuditingEntityListener.
 *
 * @EnableScheduling   — activates @Scheduled methods, including
 *                       SlaScheduler.checkSlaBreaches() which runs
 *                       every 15 minutes to detect SLA breaches.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class UnifolioApplication {

	public static void main(String[] args) {
		SpringApplication.run(UnifolioApplication.class, args);
	}

}
