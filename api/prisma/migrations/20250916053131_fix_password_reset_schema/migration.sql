/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `PasswordReset` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `passwordreset` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `PasswordReset_email_key` ON `PasswordReset`(`email`);

-- CreateIndex
CREATE INDEX `PasswordReset_createdAt_idx` ON `PasswordReset`(`createdAt`);
