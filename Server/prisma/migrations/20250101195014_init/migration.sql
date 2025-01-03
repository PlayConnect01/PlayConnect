/*
  Warnings:

  - You are about to drop the column `report_date` on the `report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `report` DROP COLUMN `report_date`,
    ADD COLUMN `action_taken` VARCHAR(191) NULL,
    ADD COLUMN `handled_at` DATETIME(3) NULL,
    ADD COLUMN `handled_by` INTEGER NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `Admin` (
    `admin_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Report_handled_by_idx` ON `Report`(`handled_by`);

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_handled_by_fkey` FOREIGN KEY (`handled_by`) REFERENCES `Admin`(`admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;
