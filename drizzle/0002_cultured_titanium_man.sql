ALTER TABLE `audit_results` MODIFY COLUMN `detectedIssues` json;--> statement-breakpoint
ALTER TABLE `audit_results` MODIFY COLUMN `emailsFound` json;--> statement-breakpoint
ALTER TABLE `audit_results` MODIFY COLUMN `phonesFound` json;--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `zones` json;--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `sectors` json;--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `logs` json;