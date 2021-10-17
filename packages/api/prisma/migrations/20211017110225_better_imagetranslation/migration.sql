/*
  Warnings:

  - You are about to drop the `ImageTranslation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ImageTranslation" DROP CONSTRAINT "ImageTranslation_imageId_fkey";

-- DropTable
DROP TABLE "ImageTranslation";

-- CreateTable
CREATE TABLE "_ImageToTourStop" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ImageToTourStop_AB_unique" ON "_ImageToTourStop"("A", "B");

-- CreateIndex
CREATE INDEX "_ImageToTourStop_B_index" ON "_ImageToTourStop"("B");

-- AddForeignKey
ALTER TABLE "_ImageToTourStop" ADD FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToTourStop" ADD FOREIGN KEY ("B") REFERENCES "TourStop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
