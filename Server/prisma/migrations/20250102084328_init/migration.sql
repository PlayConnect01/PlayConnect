-- AlterTable
ALTER TABLE `user` ADD COLUMN `ban_reason` VARCHAR(191) NULL,
    ADD COLUMN `block_reason` VARCHAR(191) NULL,
    ADD COLUMN `is_banned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_blocked` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `UserProduct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserProduct_user_id_idx`(`user_id`),
    INDEX `UserProduct_product_id_idx`(`product_id`),
    UNIQUE INDEX `UserProduct_user_id_product_id_key`(`user_id`, `product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Sport_name_idx` ON `Sport`(`name`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `UserProduct` ADD CONSTRAINT `UserProduct_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProduct` ADD CONSTRAINT `UserProduct_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `MarketplaceProduct`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
