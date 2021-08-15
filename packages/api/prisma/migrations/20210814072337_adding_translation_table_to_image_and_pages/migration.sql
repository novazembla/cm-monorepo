/*
  Warnings:

  - A unique constraint covering the columns `[id,objectTypeId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,objectTypeId]` on the table `Page` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "objectTypeId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "objectTypeId" INTEGER NOT NULL DEFAULT 2;

-- CreateTable
CREATE TABLE "ModuleTranslation" (
    "id" SERIAL NOT NULL,
    "objectTypeId" INTEGER NOT NULL,
    "objectId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(24) NOT NULL,
    "lang" VARCHAR(4) NOT NULL,
    "translation" TEXT NOT NULL,
    "objectTypeId" INTEGER NOT NULL,
    "objectId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image.id_objectTypeId_unique" ON "Image"("id", "objectTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Page.id_objectTypeId_unique" ON "Page"("id", "objectTypeId");

-- AddForeignKey
ALTER TABLE "Translation" ADD FOREIGN KEY ("objectId", "objectTypeId") REFERENCES "Image"("id", "objectTypeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD FOREIGN KEY ("objectId", "objectTypeId") REFERENCES "Page"("id", "objectTypeId") ON DELETE CASCADE ON UPDATE CASCADE;
