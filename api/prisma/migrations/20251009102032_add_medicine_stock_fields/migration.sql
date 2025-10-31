/*
  Warnings:

  - You are about to drop the column `stock` on the `medicine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `medicine` DROP COLUMN `stock`,
    ADD COLUMN `currentStock` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `stockIn` INTEGER NULL DEFAULT 0,
    ADD COLUMN `stockOut` INTEGER NULL DEFAULT 0,
    ADD COLUMN `totalStock` INTEGER NOT NULL DEFAULT 0;
