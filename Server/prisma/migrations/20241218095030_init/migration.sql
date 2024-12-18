/*
  Warnings:

  - Added the required column `sport_id` to the `MarketplaceProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `marketplaceproduct` ADD COLUMN `sport_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `auth_provider` VARCHAR(191) NULL,
    ADD COLUMN `auth_provider_id` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `MarketplaceProduct_sport_id_idx` ON `MarketplaceProduct`(`sport_id`);

-- AddForeignKey
ALTER TABLE `MarketplaceProduct` ADD CONSTRAINT `MarketplaceProduct_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `Sport`(`sport_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
