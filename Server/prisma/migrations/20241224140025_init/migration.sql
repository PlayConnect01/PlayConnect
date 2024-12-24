/*
  Warnings:

  - You are about to alter the column `type` on the `notification` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `match_id` INTEGER NULL,
    MODIFY `type` ENUM('MATCH_REQUEST', 'MATCH_ACCEPTED', 'MATCH_REJECTED', 'GENERAL', 'EVENT_INVITATION', 'TOURNAMENT_INVITATION') NOT NULL DEFAULT 'GENERAL';

-- CreateIndex
CREATE INDEX `Notification_match_id_idx` ON `Notification`(`match_id`);

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `Match`(`match_id`) ON DELETE SET NULL ON UPDATE CASCADE;
