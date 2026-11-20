-- CreateTable
CREATE TABLE `collaboration_requests` (
    `id` VARCHAR(191) NOT NULL,
    `advertiserId` VARCHAR(191) NOT NULL,
    `publisherWebsiteId` VARCHAR(191) NULL,
    `publisherServiceId` VARCHAR(191) NULL,
    `websiteNameSnapshot` VARCHAR(191) NOT NULL,
    `websiteUrlSnapshot` VARCHAR(512) NOT NULL,
    `serviceNameSnapshot` VARCHAR(120) NOT NULL,
    `serviceTypeSnapshot` ENUM('GUEST_POST', 'SPONSORED_ARTICLE', 'LINK_INSERTION', 'BANNER_ADVERTISEMENT') NOT NULL,
    `originalPrice` DECIMAL(10, 2) NOT NULL,
    `originalCurrency` CHAR(3) NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `targetUrl` VARCHAR(2048) NOT NULL,
    `anchorText` VARCHAR(191) NOT NULL,
    `proposedBudget` DECIMAL(10, 2) NOT NULL,
    `proposedCurrency` CHAR(3) NOT NULL,
    `contentRequirements` TEXT NOT NULL,
    `additionalInstructions` TEXT NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'NEGOTIATION', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `publisherResponse` TEXT NULL,
    `revisedPrice` DECIMAL(10, 2) NULL,
    `revisedCurrency` CHAR(3) NULL,
    `revisedTerms` TEXT NULL,
    `revisedAt` DATETIME(3) NULL,
    `acceptedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `dealId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `collaboration_requests_dealId_key`(`dealId`),
    INDEX `collaboration_requests_advertiserId_createdAt_idx`(`advertiserId`, `createdAt`),
    INDEX `collaboration_requests_publisherWebsiteId_status_createdAt_idx`(`publisherWebsiteId`, `status`, `createdAt`),
    INDEX `collaboration_requests_publisherServiceId_status_idx`(`publisherServiceId`, `status`),
    INDEX `collaboration_requests_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `collaboration_requests` ADD CONSTRAINT `collaboration_requests_advertiserId_fkey` FOREIGN KEY (`advertiserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collaboration_requests` ADD CONSTRAINT `collaboration_requests_publisherWebsiteId_fkey` FOREIGN KEY (`publisherWebsiteId`) REFERENCES `publisher_websites`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collaboration_requests` ADD CONSTRAINT `collaboration_requests_publisherServiceId_fkey` FOREIGN KEY (`publisherServiceId`) REFERENCES `publisher_services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
