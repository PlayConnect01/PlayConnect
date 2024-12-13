/*
  Warnings:

  - You are about to alter the column `status` on the `match` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `match` ADD COLUMN `chat_id` INTEGER NULL,
    MODIFY `status` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Match_chat_id_idx` ON `Match`(`chat_id`);

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `Chat`(`chat_id`) ON DELETE SET NULL ON UPDATE CASCADE;
