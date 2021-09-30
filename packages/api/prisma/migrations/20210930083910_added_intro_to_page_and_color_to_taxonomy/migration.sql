/*
  Warnings:

  - You are about to drop the column `uuid` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `objectTypeId` on the `Page` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nanoid]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nanoid` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intro` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ImageTranslation" DROP CONSTRAINT "ImageTranslation_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Term" DROP CONSTRAINT "Term_taxonomyId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_fkey";

-- DropIndex
DROP INDEX "Image.uuid_unique";

-- DropIndex
DROP INDEX "Page.id_objectTypeId_unique";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "uuid",
ADD COLUMN     "nanoid" VARCHAR(48) NOT NULL,
ADD COLUMN     "orderNumber" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Page" DROP COLUMN "objectTypeId",
ADD COLUMN     "intro" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Taxonomy" ADD COLUMN     "hasColor" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "color" TEXT NOT NULL DEFAULT E'';

-- CreateIndex
CREATE UNIQUE INDEX "Image_nanoid_key" ON "Image"("nanoid");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "Taxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageTranslation" ADD CONSTRAINT "ImageTranslation_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "uniqueTransKeys" RENAME TO "ImageTranslation_imageId_key_lang_key";

-- RenameIndex
ALTER INDEX "Module.key_unique" RENAME TO "Module_key_key";

-- RenameIndex
ALTER INDEX "Setting.key_unique" RENAME TO "Setting_key_key";

-- RenameIndex
ALTER INDEX "User.email_unique" RENAME TO "User_email_key";
