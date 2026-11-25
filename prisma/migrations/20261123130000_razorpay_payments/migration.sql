ALTER TABLE `orders`
  MODIFY `paymentStatus` ENUM('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING';

ALTER TABLE `orders`
  ADD COLUMN `razorpayOrderId` VARCHAR(191) NULL,
  ADD COLUMN `razorpayPaymentId` VARCHAR(191) NULL,
  ADD COLUMN `razorpayRefundId` VARCHAR(191) NULL,
  ADD COLUMN `paymentAmount` INTEGER NULL,
  ADD COLUMN `paymentCurrency` CHAR(3) NULL,
  ADD COLUMN `paymentCapturedAt` DATETIME(3) NULL,
  ADD COLUMN `paymentRefundedAt` DATETIME(3) NULL,
  ADD COLUMN `paymentFailureCode` VARCHAR(191) NULL,
  ADD COLUMN `paymentFailureMessage` VARCHAR(512) NULL,
  ADD COLUMN `paymentUpdatedAt` DATETIME(3) NULL;

CREATE UNIQUE INDEX `orders_razorpayOrderId_key` ON `orders`(`razorpayOrderId`);
CREATE UNIQUE INDEX `orders_razorpayPaymentId_key` ON `orders`(`razorpayPaymentId`);
CREATE UNIQUE INDEX `orders_razorpayRefundId_key` ON `orders`(`razorpayRefundId`);
CREATE INDEX `orders_razorpayPaymentId_idx` ON `orders`(`razorpayPaymentId`);

CREATE TABLE `payment_attempts` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `idempotencyKey` VARCHAR(191) NOT NULL,
  `razorpayOrderId` VARCHAR(191) NULL,
  `razorpayPaymentId` VARCHAR(191) NULL,
  `amount` INTEGER NOT NULL,
  `currency` CHAR(3) NOT NULL,
  `status` ENUM('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `failureCode` VARCHAR(191) NULL,
  `failureMessage` VARCHAR(512) NULL,
  `lastVerifiedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `payment_attempts_idempotencyKey_key`(`idempotencyKey`),
  UNIQUE INDEX `payment_attempts_razorpayOrderId_key`(`razorpayOrderId`),
  UNIQUE INDEX `payment_attempts_razorpayPaymentId_key`(`razorpayPaymentId`),
  INDEX `payment_attempts_orderId_createdAt_idx`(`orderId`, `createdAt`),
  INDEX `payment_attempts_status_createdAt_idx`(`status`, `createdAt`),
  CONSTRAINT `payment_attempts_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `razorpay_webhook_events` (
  `id` VARCHAR(191) NOT NULL,
  `eventName` VARCHAR(191) NOT NULL,
  `processedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `payloadHash` CHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `razorpay_webhook_events_eventName_processedAt_idx`(`eventName`, `processedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
