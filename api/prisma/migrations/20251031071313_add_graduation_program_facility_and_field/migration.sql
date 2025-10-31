/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `FieldOfPractice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `register` ADD COLUMN `fieldOfGraduation` VARCHAR(191) NULL,
    ADD COLUMN `graduationProgramFacility` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `FieldOfPractice_name_key` ON `FieldOfPractice`(`name`);
