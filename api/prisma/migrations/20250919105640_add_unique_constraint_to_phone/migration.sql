/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Register` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Register_phone_key` ON `Register`(`phone`);
