/*
  Warnings:

  - The values [DISTRICT_VET] on the enum `Register_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `register` MODIFY `role` ENUM('BASIC_VET', 'SECTOR_VET', 'ADMIN') NOT NULL;
