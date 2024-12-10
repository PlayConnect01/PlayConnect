/*
  Warnings:

  - You are about to drop the column `related_id` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `notification` table. All the data in the column will be lost.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_id` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` DROP COLUMN `related_id`,
    DROP COLUMN `type`,
    ADD COLUMN `action_url` VARCHAR(191) NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL,
    ADD COLUMN `type_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `NotificationType` (
    `type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,

    PRIMARY KEY (`type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Notification_type_id_idx` ON `Notification`(`type_id`);

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `NotificationType`(`type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
