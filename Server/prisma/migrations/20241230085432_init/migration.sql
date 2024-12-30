-- CreateTable
CREATE TABLE `Order` (
    `order_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `total_amount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `payment_intent_id` VARCHAR(191) NOT NULL,

    INDEX `Order_user_id_idx`(`user_id`),
    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
