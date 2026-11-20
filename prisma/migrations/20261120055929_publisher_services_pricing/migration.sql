-- CreateTable
CREATE TABLE `publisher_services` (
    `id` VARCHAR(191) NOT NULL,
    `publisherWebsiteId` VARCHAR(191) NOT NULL,
    `serviceName` VARCHAR(120) NOT NULL,
    `serviceType` ENUM('GUEST_POST', 'SPONSORED_ARTICLE', 'LINK_INSERTION', 'BANNER_ADVERTISEMENT') NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL,
    `deliveryTimeDays` INTEGER NOT NULL,
    `contentWritingIncluded` BOOLEAN NOT NULL DEFAULT false,
    `linkType` ENUM('DOFOLLOW', 'NOFOLLOW', 'BOTH', 'NOT_APPLICABLE') NOT NULL DEFAULT 'NOT_APPLICABLE',
    `maximumLinks` INTEGER NULL,
    `homepageLinkAvailable` BOOLEAN NOT NULL DEFAULT false,
    `description` TEXT NOT NULL,
    `publishingGuidelines` TEXT NULL,
    `additionalConditions` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `publisher_services_publisherWebsiteId_createdAt_idx`(`publisherWebsiteId`, `createdAt`),
    INDEX `publisher_services_publisherWebsiteId_serviceType_isActive_idx`(`publisherWebsiteId`, `serviceType`, `isActive`),
    INDEX `publisher_services_isActive_archivedAt_idx`(`isActive`, `archivedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `publisher_services` ADD CONSTRAINT `publisher_services_publisherWebsiteId_fkey` FOREIGN KEY (`publisherWebsiteId`) REFERENCES `publisher_websites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
