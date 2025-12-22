-- Manual migration to add modern news content tables without touching legacy data.
-- Applies to database: agh_copy
-- Engine/charset chosen to avoid legacy MyISAM quirks.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `news_sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `sortOrder` double DEFAULT NULL,
  `createdAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `news_sections_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `news_articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sectionId` int NOT NULL,
  `slug` varchar(200) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `excerpt` text,
  `author` varchar(150) DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `publishedAt` datetime(0) DEFAULT NULL,
  `isFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `legacyId` int DEFAULT NULL,
  `createdAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `news_articles_slug_key` (`slug`),
  KEY `news_articles_sectionId_idx` (`sectionId`),
  CONSTRAINT `news_articles_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `news_sections` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `news_blocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `articleId` int NOT NULL,
  `position` int NOT NULL DEFAULT 0,
  `type` enum('PARAGRAPH','HEADING','QUOTE','LIST','TABLE','CODE','IMAGE','HTML') NOT NULL,
  `content` text,
  `meta` json DEFAULT NULL,
  `createdAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `news_blocks_articleId_position_idx` (`articleId`,`position`),
  CONSTRAINT `news_blocks_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `news_articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
