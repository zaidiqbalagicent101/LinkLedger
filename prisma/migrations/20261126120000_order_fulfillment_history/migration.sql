CREATE TABLE `order_fulfillment_events` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `actorId` VARCHAR(191) NOT NULL,
  `type` ENUM('STARTED', 'CONTENT_SUBMITTED', 'REVISION_REQUESTED', 'CONTENT_APPROVED', 'FINAL_URL_SUBMITTED', 'FINAL_URL_APPROVED', 'COMPLETED') NOT NULL,
  `contentUrl` VARCHAR(2048) NULL,
  `contentText` LONGTEXT NULL,
  `feedback` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `order_fulfillment_events_orderId_createdAt_idx` (`orderId`, `createdAt`),
  INDEX `order_fulfillment_events_actorId_createdAt_idx` (`actorId`, `createdAt`),
  CONSTRAINT `order_fulfillment_events_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_fulfillment_events_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;