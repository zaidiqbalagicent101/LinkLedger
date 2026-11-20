-- AlterTable
ALTER TABLE `collaboration_requests` ADD COLUMN `additionalConditionsSnapshot` TEXT NULL,
    ADD COLUMN `domainAuthoritySnapshot` INTEGER NULL,
    ADD COLUMN `domainRatingSnapshot` INTEGER NULL,
    ADD COLUMN `monthlyTrafficSnapshot` INTEGER NULL,
    ADD COLUMN `originalContentWritingIncluded` BOOLEAN NULL,
    ADD COLUMN `originalDeliveryTimeDays` INTEGER NULL,
    ADD COLUMN `originalHomepageLinkAvailable` BOOLEAN NULL,
    ADD COLUMN `originalLinkType` ENUM('DOFOLLOW', 'NOFOLLOW', 'BOTH', 'NOT_APPLICABLE') NULL,
    ADD COLUMN `originalMaximumLinks` INTEGER NULL,
    ADD COLUMN `publishingGuidelinesSnapshot` TEXT NULL,
    ADD COLUMN `requestedDeliveryTimeDays` INTEGER NULL,
    ADD COLUMN `requestedHomepageLinkAvailable` BOOLEAN NULL,
    ADD COLUMN `requestedLinkType` ENUM('DOFOLLOW', 'NOFOLLOW', 'BOTH', 'NOT_APPLICABLE') NULL,
    ADD COLUMN `requestedNumberOfLinks` INTEGER NULL,
    ADD COLUMN `revisedDeliveryTimeDays` INTEGER NULL,
    ADD COLUMN `revisedHomepageLinkAvailable` BOOLEAN NULL,
    ADD COLUMN `revisedLinkType` ENUM('DOFOLLOW', 'NOFOLLOW', 'BOTH', 'NOT_APPLICABLE') NULL,
    ADD COLUMN `revisedNumberOfLinks` INTEGER NULL,
    ADD COLUMN `serviceDescriptionSnapshot` TEXT NULL,
    ADD COLUMN `targetAudienceCountrySnapshot` VARCHAR(100) NULL,
    ADD COLUMN `websiteDescriptionSnapshot` TEXT NULL,
    ADD COLUMN `websiteLanguageSnapshot` VARCHAR(80) NULL,
    ADD COLUMN `websiteNicheSnapshot` VARCHAR(120) NULL;

-- CreateTable
CREATE TABLE `collaboration_messages` (
    `id` VARCHAR(191) NOT NULL,
    `collaborationRequestId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `type` ENUM('MESSAGE', 'PROPOSAL') NOT NULL DEFAULT 'MESSAGE',
    `body` TEXT NOT NULL,
    `proposalPrice` DECIMAL(10, 2) NULL,
    `proposalCurrency` CHAR(3) NULL,
    `proposalDeliveryTimeDays` INTEGER NULL,
    `proposalNumberOfLinks` INTEGER NULL,
    `proposalHomepageLinkAvailable` BOOLEAN NULL,
    `proposalLinkType` ENUM('DOFOLLOW', 'NOFOLLOW', 'BOTH', 'NOT_APPLICABLE') NULL,
    `proposalTerms` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `collaboration_messages_collaborationRequestId_createdAt_idx`(`collaborationRequestId`, `createdAt`),
    INDEX `collaboration_messages_senderId_createdAt_idx`(`senderId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `source` ENUM('DIRECT_PURCHASE', 'CUSTOM_DEAL') NOT NULL,
    `status` ENUM('CONFIRMED', 'IN_PROGRESS', 'CONTENT_SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'PUBLISHED', 'COMPLETED', 'CANCELLATION_REQUESTED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    `paymentStatus` ENUM('PENDING', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `advertiserId` VARCHAR(191) NOT NULL,
    `publisherWebsiteId` VARCHAR(191) NULL,
    `publisherServiceId` VARCHAR(191) NULL,
    `customRequestId` VARCHAR(191) NULL,
    `websiteNameSnapshot` VARCHAR(191) NOT NULL,
    `websiteUrlSnapshot` VARCHAR(512) NOT NULL,
    `websiteNicheSnapshot` VARCHAR(120) NOT NULL,
    `monthlyTrafficSnapshot` INTEGER NOT NULL,
    `websiteLanguageSnapshot` VARCHAR(80) NOT NULL,
    `targetAudienceCountrySnapshot` VARCHAR(100) NOT NULL,
    `websiteDescriptionSnapshot` TEXT NOT NULL,
    `domainRatingSnapshot` INTEGER NULL,
    `domainAuthoritySnapshot` INTEGER NULL,
    `serviceNameSnapshot` VARCHAR(120) NOT NULL,
    `serviceTypeSnapshot` ENUM('GUEST_POST', 'SPONSORED_ARTICLE', 'LINK_INSERTION', 'BANNER_ADVERTISEMENT') NOT NULL,
    `serviceDescriptionSnapshot` TEXT NOT NULL,
    `publishingGuidelinesSnapshot` TEXT NULL,
    `additionalConditionsSnapshot` TEXT NULL,
    `originalPrice` DECIMAL(10, 2) NOT NULL,
    `originalCurrency` CHAR(3) NOT NULL,
    `originalDeliveryTimeDays` INTEGER NOT NULL,
    `originalContentWritingIncluded` BOOLEAN NOT NULL,
    `originalLinkType` ENUM('DOFOLLOW', 'NOFOLLOW', 'BOTH', 'NOT_APPLICABLE') NOT NULL,
    `originalMaximumLinks` INTEGER NULL,
    `originalHomepageLinkAvailable` BOOLEAN NOT NULL,
    `agreedPrice` DECIMAL(10, 2) NOT NULL,
    `agreedCurrency` CHAR(3) NOT NULL,
    `agreedDeliveryTimeDays` INTEGER NOT NULL,
    `agreedContentWritingIncluded` BOOLEAN NOT NULL,
    `agreedLinkType` ENUM('DOFOLLOW', 'NOFOLLOW', 'BOTH', 'NOT_APPLICABLE') NOT NULL,
    `agreedNumberOfLinks` INTEGER NULL,
    `agreedHomepageLinkAvailable` BOOLEAN NOT NULL,
    `topic` VARCHAR(191) NULL,
    `targetUrl` VARCHAR(2048) NULL,
    `anchorText` VARCHAR(191) NULL,
    `contentRequirements` TEXT NOT NULL,
    `additionalInstructions` TEXT NOT NULL,
    `cancellationReason` TEXT NULL,
    `cancellationRequestedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_idempotencyKey_key`(`idempotencyKey`),
    UNIQUE INDEX `orders_customRequestId_key`(`customRequestId`),
    INDEX `orders_advertiserId_createdAt_idx`(`advertiserId`, `createdAt`),
    INDEX `orders_publisherWebsiteId_status_createdAt_idx`(`publisherWebsiteId`, `status`, `createdAt`),
    INDEX `orders_publisherServiceId_status_idx`(`publisherServiceId`, `status`),
    INDEX `orders_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `orders_paymentStatus_createdAt_idx`(`paymentStatus`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `collaboration_messages` ADD CONSTRAINT `collaboration_messages_collaborationRequestId_fkey` FOREIGN KEY (`collaborationRequestId`) REFERENCES `collaboration_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collaboration_messages` ADD CONSTRAINT `collaboration_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_advertiserId_fkey` FOREIGN KEY (`advertiserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_publisherWebsiteId_fkey` FOREIGN KEY (`publisherWebsiteId`) REFERENCES `publisher_websites`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_publisherServiceId_fkey` FOREIGN KEY (`publisherServiceId`) REFERENCES `publisher_services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customRequestId_fkey` FOREIGN KEY (`customRequestId`) REFERENCES `collaboration_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
