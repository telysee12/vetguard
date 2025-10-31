-- CreateTable
CREATE TABLE `MedicineStockMovement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `medicineId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MedicineStockMovement` ADD CONSTRAINT `MedicineStockMovement_medicineId_fkey` FOREIGN KEY (`medicineId`) REFERENCES `Medicine`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
