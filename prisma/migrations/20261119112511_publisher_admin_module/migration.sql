-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADVERTISER', 'ADMIN', 'PUBLISHER') NOT NULL;

-- CreateTable
CREATE TABLE `publisher_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `publisherName` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(191) NULL,
    `country` VARCHAR(100) NOT NULL,
    `contactNumber` VARCHAR(40) NULL,
    `description` TEXT NOT NULL,
    `profileImage` VARCHAR(2048) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `publisher_profiles_userId_key`(`userId`),
    INDEX `publisher_profiles_country_idx`(`country`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `publisher_websites` (
    `id` VARCHAR(191) NOT NULL,
    `publisherProfileId` VARCHAR(191) NOT NULL,
    `websiteName` VARCHAR(191) NOT NULL,
    `websiteUrl` VARCHAR(512) NOT NULL,
    `websiteNiche` VARCHAR(120) NOT NULL,
    `monthlyTraffic` INTEGER NOT NULL,
    `websiteLanguage` VARCHAR(80) NOT NULL,
    `targetAudienceCountry` VARCHAR(100) NOT NULL,
    `websiteDescription` TEXT NOT NULL,
    `websiteLogo` VARCHAR(2048) NULL,
    `domainRating` INTEGER NULL,
    `domainAuthority` INTEGER NULL,
    `metricsVerified` BOOLEAN NOT NULL DEFAULT false,
    `approvalStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejectionReason` TEXT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `publisher_websites_websiteUrl_key`(`websiteUrl`),
    INDEX `publisher_websites_publisherProfileId_createdAt_idx`(`publisherProfileId`, `createdAt`),
    INDEX `publisher_websites_approvalStatus_createdAt_idx`(`approvalStatus`, `createdAt`),
    INDEX `publisher_websites_reviewedById_idx`(`reviewedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `website_reviews` (
    `id` VARCHAR(191) NOT NULL,
    `publisherWebsiteId` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    `rejectionReason` TEXT NULL,
    `reviewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `website_reviews_publisherWebsiteId_reviewedAt_idx`(`publisherWebsiteId`, `reviewedAt`),
    INDEX `website_reviews_adminId_reviewedAt_idx`(`adminId`, `reviewedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `publisher_profiles` ADD CONSTRAINT `publisher_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `publisher_websites` ADD CONSTRAINT `publisher_websites_publisherProfileId_fkey` FOREIGN KEY (`publisherProfileId`) REFERENCES `publisher_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `publisher_websites` ADD CONSTRAINT `publisher_websites_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `website_reviews` ADD CONSTRAINT `website_reviews_publisherWebsiteId_fkey` FOREIGN KEY (`publisherWebsiteId`) REFERENCES `publisher_websites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `website_reviews` ADD CONSTRAINT `website_reviews_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
