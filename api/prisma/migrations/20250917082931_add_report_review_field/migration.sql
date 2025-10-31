/*
  Warnings:

  - Made the column `ownerEmail` on table `patient` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `patient` MODIFY `ownerEmail` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `report` ADD COLUMN `countryReviewedAt` DATETIME(3) NULL,
    ADD COLUMN `countryReviewedBy` INTEGER NULL,
    ADD COLUMN `countryStatus` ENUM('PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'REQUIRES_REVISION') NULL,
    ADD COLUMN `countryVetNotes` VARCHAR(191) NULL,
    ADD COLUMN `districtReviewedAt` DATETIME(3) NULL,
    ADD COLUMN `districtReviewedBy` INTEGER NULL,
    ADD COLUMN `districtVetNotes` VARCHAR(191) NULL;
