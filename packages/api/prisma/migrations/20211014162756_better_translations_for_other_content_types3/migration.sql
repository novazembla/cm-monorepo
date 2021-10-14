/*
  Warnings:

  - You are about to drop the column `accessibilityInformation` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `offers` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Location` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "accessibilityInformation",
DROP COLUMN "description",
DROP COLUMN "offers",
DROP COLUMN "slug",
DROP COLUMN "title";
