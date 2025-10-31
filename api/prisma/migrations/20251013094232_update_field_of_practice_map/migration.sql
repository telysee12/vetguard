/*
  Warnings:

  - You are about to drop the column `specialization` on the `vetlicenseapplication` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `vetlicenseapplication` DROP COLUMN `specialization`,
    ADD COLUMN `FieldOfPractice` VARCHAR(191) NULL;
