/*
  Warnings:

  - You are about to drop the `_LocationToTerm` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[primaryTypeId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_LocationToTerm" DROP CONSTRAINT "_LocationToTerm_A_fkey";

-- DropForeignKey
ALTER TABLE "_LocationToTerm" DROP CONSTRAINT "_LocationToTerm_B_fkey";

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "primaryTypeId" INTEGER;

-- DropTable
DROP TABLE "_LocationToTerm";

-- CreateTable
CREATE TABLE "_locationTerms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_locationTerms_AB_unique" ON "_locationTerms"("A", "B");

-- CreateIndex
CREATE INDEX "_locationTerms_B_index" ON "_locationTerms"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Location_primaryTypeId_unique" ON "Location"("primaryTypeId");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_primaryTypeId_fkey" FOREIGN KEY ("primaryTypeId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_locationTerms" ADD FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_locationTerms" ADD FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
