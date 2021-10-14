/*
  Warnings:

  - You are about to drop the column `address_de` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `address_en` on the `Location` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "address_de",
DROP COLUMN "address_en",
ADD COLUMN     "accessibilityInformation_de" TEXT DEFAULT E'',
ADD COLUMN     "accessibilityInformation_en" TEXT DEFAULT E'';
