/*
  Warnings:

  - You are about to drop the column `point_reward` on the `marketplaceproduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `marketplaceproduct` DROP COLUMN `point_reward`,
    ADD COLUMN `rating` INTEGER NOT NULL DEFAULT 5;
