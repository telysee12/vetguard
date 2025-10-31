/*
  Warnings:

  - You are about to drop the column `countryReviewedAt` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `countryReviewedBy` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `countryStatus` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `countryVetNotes` on the `report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `report` DROP COLUMN `countryReviewedAt`,
    DROP COLUMN `countryReviewedBy`,
    DROP COLUMN `countryStatus`,
    DROP COLUMN `countryVetNotes`;
