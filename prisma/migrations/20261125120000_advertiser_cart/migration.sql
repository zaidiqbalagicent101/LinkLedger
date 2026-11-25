CREATE TABLE `advertiser_cart_items` (
  `id` VARCHAR(191) NOT NULL,
  `advertiserId` VARCHAR(191) NOT NULL,
  `publisherServiceId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `advertiser_cart_items_advertiserId_publisherServiceId_key` (`advertiserId`, `publisherServiceId`),
  INDEX `advertiser_cart_items_advertiserId_createdAt_idx` (`advertiserId`, `createdAt`),
  CONSTRAINT `advertiser_cart_items_advertiserId_fkey` FOREIGN KEY (`advertiserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `advertiser_cart_items_publisherServiceId_fkey` FOREIGN KEY (`publisherServiceId`) REFERENCES `publisher_services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;