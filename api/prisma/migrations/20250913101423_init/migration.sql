-- CreateTable
CREATE TABLE `Register` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `nationalId` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `sector` VARCHAR(191) NOT NULL,
    `cell` VARCHAR(191) NOT NULL,
    `village` VARCHAR(191) NOT NULL,
    `graduationYear` INTEGER NULL,
    `workplace` VARCHAR(191) NULL,
    `degreeCert` VARCHAR(191) NULL,
    `nationalIdCopy` VARCHAR(191) NULL,
    `license` VARCHAR(191) NULL,
    `role` ENUM('BASIC_VET', 'SECTOR_VET', 'DISTRICT_VET', 'ADMIN') NOT NULL,
    `isFirstLogin` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` INTEGER NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `approvedBy` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectedBy` INTEGER NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Register_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Patient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `animalName` VARCHAR(191) NOT NULL,
    `ownerName` VARCHAR(191) NOT NULL,
    `ownerPhone` VARCHAR(191) NOT NULL,
    `ownerEmail` VARCHAR(191) NULL,
    `ownerIdNumber` VARCHAR(191) NULL,
    `province` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NULL,
    `sector` VARCHAR(191) NULL,
    `cell` VARCHAR(191) NULL,
    `village` VARCHAR(191) NULL,
    `previousConditions` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Treatment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `diagnosisAndNotes` VARCHAR(191) NULL,
    `medicinesAndPrescription` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Treatment` ADD CONSTRAINT `Treatment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
