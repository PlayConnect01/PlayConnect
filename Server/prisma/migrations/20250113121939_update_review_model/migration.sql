/*
  Warnings:

  - A unique constraint covering the columns `[user_id,product_id]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_event_id_fkey`;

-- AlterTable
ALTER TABLE `marketplaceproduct` ADD COLUMN `review_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `review` ADD COLUMN `product_id` INTEGER NULL,
    MODIFY `event_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Review_product_id_idx` ON `Review`(`product_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Review_user_id_product_id_key` ON `Review`(`user_id`, `product_id`);

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event`(`event_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `MarketplaceProduct`(`product_id`) ON DELETE SET NULL ON UPDATE CASCADE;
