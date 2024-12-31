-- AlterTable
ALTER TABLE `order` ADD COLUMN `completed_at` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Order_payment_intent_id_idx` ON `Order`(`payment_intent_id`);
