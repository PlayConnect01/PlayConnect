/*
  Warnings:

  - You are about to alter the column `message_type` on the `message` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to drop the column `related_id` on the `notification` table. All the data in the column will be lost.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chat` ADD COLUMN `call_duration` DOUBLE NULL,
    ADD COLUMN `call_end_time` DATETIME(3) NULL,
    ADD COLUMN `call_initiator_id` INTEGER NULL,
    ADD COLUMN `call_start_time` DATETIME(3) NULL,
    ADD COLUMN `call_status` ENUM('INITIATED', 'IN_PROGRESS', 'ENDED', 'MISSED') NULL,
    ADD COLUMN `call_type` ENUM('NONE', 'VOICE', 'VIDEO') NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE `message` ADD COLUMN `voice_duration` DOUBLE NULL,
    ADD COLUMN `voice_file_url` VARCHAR(191) NULL,
    MODIFY `message_type` ENUM('TEXT', 'VOICE', 'IMAGE', 'VIDEO', 'SYSTEM') NOT NULL;

-- AlterTable
ALTER TABLE `notification` DROP COLUMN `related_id`,
    ADD COLUMN `action_url` VARCHAR(191) NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Match` (
    `match_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id_1` INTEGER NOT NULL,
    `user_id_2` INTEGER NOT NULL,
    `sport_id` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED') NOT NULL,
    `matched_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `accepted_at` DATETIME(3) NULL,
    `rejected_at` DATETIME(3) NULL,

    INDEX `Match_user_id_1_idx`(`user_id_1`),
    INDEX `Match_user_id_2_idx`(`user_id_2`),
    INDEX `Match_sport_id_idx`(`sport_id`),
    PRIMARY KEY (`match_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_call_initiator_id_fkey` FOREIGN KEY (`call_initiator_id`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_user_id_1_fkey` FOREIGN KEY (`user_id_1`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_user_id_2_fkey` FOREIGN KEY (`user_id_2`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `Sport`(`sport_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
