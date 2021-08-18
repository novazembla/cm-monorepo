/*
  Warnings:

  - You are about to drop the column `objectTypeId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the `Translation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_objectId_objectTypeId_fkey";

-- DropIndex
DROP INDEX "asdfdsdsfasdf";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "objectTypeId";

-- DropTable
DROP TABLE "Translation";

-- CreateTable
CREATE TABLE "ImageTranslation" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(24) NOT NULL,
    "lang" VARCHAR(4) NOT NULL,
    "translation" TEXT NOT NULL,
    "imageId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImageTranslation" ADD FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
