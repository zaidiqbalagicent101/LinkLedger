-- AlterTable
ALTER TABLE `orders` ADD COLUMN `cancellationRespondedAt` DATETIME(3) NULL,
    ADD COLUMN `cancellationResponse` TEXT NULL,
    ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `publishedAt` DATETIME(3) NULL;
