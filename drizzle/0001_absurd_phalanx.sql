CREATE TABLE `conversionHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`pdfFileId` int,
	`imageCount` int NOT NULL,
	`processingTimeMs` int NOT NULL,
	`status` enum('success','failed') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversionHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`originalUrl` varchar(512) NOT NULL,
	`editedUrl` varchar(512),
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(50) NOT NULL,
	`fileSizeBytes` int NOT NULL,
	`width` int,
	`height` int,
	`rotation` int NOT NULL DEFAULT 0,
	`cropData` json,
	`brightness` int NOT NULL DEFAULT 100,
	`contrast` int NOT NULL DEFAULT 100,
	`filters` json,
	`pageNumber` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pdfFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` varchar(512) NOT NULL,
	`fileSizeBytes` int NOT NULL,
	`pageCount` int NOT NULL,
	`status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pdfFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('draft','completed','archived') NOT NULL DEFAULT 'draft',
	`pageSize` varchar(50) NOT NULL DEFAULT 'A4',
	`orientation` enum('portrait','landscape') NOT NULL DEFAULT 'portrait',
	`imageQuality` enum('low','medium','high') NOT NULL DEFAULT 'high',
	`watermark` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `textAnnotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`pageNumber` int NOT NULL,
	`content` text NOT NULL,
	`fontSize` int NOT NULL DEFAULT 12,
	`fontFamily` varchar(100) NOT NULL DEFAULT 'Arial',
	`fontColor` varchar(7) NOT NULL DEFAULT '#000000',
	`positionX` decimal(10,2) NOT NULL DEFAULT '0',
	`positionY` decimal(10,2) NOT NULL DEFAULT '0',
	`bold` boolean NOT NULL DEFAULT false,
	`italic` boolean NOT NULL DEFAULT false,
	`underline` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `textAnnotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`theme` enum('light','dark','auto') NOT NULL DEFAULT 'auto',
	`defaultPageSize` varchar(50) NOT NULL DEFAULT 'A4',
	`defaultOrientation` enum('portrait','landscape') NOT NULL DEFAULT 'portrait',
	`defaultImageQuality` enum('low','medium','high') NOT NULL DEFAULT 'high',
	`enableNotifications` boolean NOT NULL DEFAULT true,
	`enableAutoSave` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
