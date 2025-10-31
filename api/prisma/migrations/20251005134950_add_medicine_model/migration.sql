-- CreateTable
CREATE TABLE `Medicine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `stock` INTEGER NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `expiryDate` DATETIME(3) NULL,
    `veterinarianId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Medicine` ADD CONSTRAINT `Medicine_veterinarianId_fkey` FOREIGN KEY (`veterinarianId`) REFERENCES `Register`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
