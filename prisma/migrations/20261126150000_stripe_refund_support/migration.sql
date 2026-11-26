ALTER TABLE `orders`
  ADD COLUMN `stripeRefundId` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `orders_stripeRefundId_key` (`stripeRefundId`);
