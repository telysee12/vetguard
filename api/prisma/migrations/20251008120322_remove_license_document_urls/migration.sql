/*
  Warnings:

  - You are about to drop the column `degreeCertUrl` on the `vetlicenseapplication` table. All the data in the column will be lost.
  - You are about to drop the column `feeStatus` on the `vetlicenseapplication` table. All the data in the column will be lost.
  - You are about to drop the column `idDocumentUrl` on the `vetlicenseapplication` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `vetlicenseapplication` DROP COLUMN `degreeCertUrl`,
    DROP COLUMN `feeStatus`,
    DROP COLUMN `idDocumentUrl`;
