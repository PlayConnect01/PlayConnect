/*
  Warnings:

  - You are about to drop the column `action_url` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `type_id` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the `notificationtype` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_type_id_fkey`;

-- AlterTable
ALTER TABLE `notification` DROP COLUMN `action_url`,
    DROP COLUMN `title`,
    DROP COLUMN `type_id`,
    ADD COLUMN `related_id` INTEGER NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `notificationtype`;
