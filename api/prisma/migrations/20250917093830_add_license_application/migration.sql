-- AlterTable
ALTER TABLE `patient` MODIFY `ownerEmail` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `report` MODIFY `content` TEXT NOT NULL,
    MODIFY `sectorVetNotes` TEXT NULL,
    MODIFY `countryVetNotes` TEXT NULL,
    MODIFY `districtVetNotes` TEXT NULL;

-- CreateTable
CREATE TABLE `VetLicenseApplication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vetId` INTEGER NOT NULL,
    `specialization` VARCHAR(191) NULL,
    `licenseType` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `degreeCertUrl` VARCHAR(191) NOT NULL,
    `idDocumentUrl` VARCHAR(191) NOT NULL,
    `paymentReceiptUrl` VARCHAR(191) NULL,
    `feeStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `reviewNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VetLicenseApplication` ADD CONSTRAINT `VetLicenseApplication_vetId_fkey` FOREIGN KEY (`vetId`) REFERENCES `Register`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
