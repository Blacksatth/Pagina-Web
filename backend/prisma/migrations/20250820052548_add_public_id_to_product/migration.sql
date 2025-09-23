/*
  Warnings:

  - You are about to drop the column `createdAt` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `extraImages` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `createdAt`,
    DROP COLUMN `extraImages`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `publicId` VARCHAR(191) NULL,
    ALTER COLUMN `stock` DROP DEFAULT;
