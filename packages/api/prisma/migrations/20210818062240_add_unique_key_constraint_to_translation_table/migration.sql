/*
  Warnings:

  - A unique constraint covering the columns `[imageId,key,lang]` on the table `ImageTranslation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "uniqueTransKeys" ON "ImageTranslation"("imageId", "key", "lang");
