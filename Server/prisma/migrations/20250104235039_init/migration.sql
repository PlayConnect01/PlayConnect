-- DropForeignKey
ALTER TABLE `tournament` DROP FOREIGN KEY `Tournament_created_by_fkey`;

-- AddForeignKey
ALTER TABLE `Tournament` ADD CONSTRAINT `Tournament_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `Admin`(`admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
