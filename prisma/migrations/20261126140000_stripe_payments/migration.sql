ALTER TABLE `payment_attempts`
  ADD COLUMN `provider` ENUM('RAZORPAY', 'STRIPE') NOT NULL DEFAULT 'RAZORPAY',
  ADD COLUMN `stripeCheckoutSessionId` VARCHAR(191) NULL,
  ADD COLUMN `stripePaymentIntentId` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `payment_attempts_stripeCheckoutSessionId_key` (`stripeCheckoutSessionId`),
  ADD UNIQUE INDEX `payment_attempts_stripePaymentIntentId_key` (`stripePaymentIntentId`);

ALTER TABLE `orders`
  ADD COLUMN `directPurchaseKey` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `orders_directPurchaseKey_key` (`directPurchaseKey`);

CREATE TABLE `stripe_webhook_events` (
  `id` VARCHAR(191) NOT NULL,
  `eventName` VARCHAR(191) NOT NULL,
  `processedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `payloadHash` CHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `stripe_webhook_events_eventName_processedAt_idx` (`eventName`, `processedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;