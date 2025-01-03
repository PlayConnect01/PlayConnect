-- AlterTable
ALTER TABLE `event` ADD COLUMN `admin_note` VARCHAR(191) NULL,
    ADD COLUMN `reviewed_at` DATETIME(3) NULL,
    ADD COLUMN `reviewed_by` INTEGER NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX `Event_reviewed_by_idx` ON `Event`(`reviewed_by`);

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `Admin`(`admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;
