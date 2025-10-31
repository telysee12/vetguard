/*
  Warnings:

  - Added the required column `veterinarianId` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `veterinarianId` to the `Treatment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `patient` ADD COLUMN `veterinarianId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `treatment` ADD COLUMN `veterinarianId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_veterinarianId_fkey` FOREIGN KEY (`veterinarianId`) REFERENCES `Register`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Treatment` ADD CONSTRAINT `Treatment_veterinarianId_fkey` FOREIGN KEY (`veterinarianId`) REFERENCES `Register`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
