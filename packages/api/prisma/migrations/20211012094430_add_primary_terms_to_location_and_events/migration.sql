/*
  Warnings:

  - You are about to drop the column `primaryTypeId` on the `Location` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_primaryTypeId_fkey";

-- DropIndex
DROP INDEX "Location_primaryTypeId_unique";

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "primaryTypeId";

-- CreateTable
CREATE TABLE "_locationPrimaryTerms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_eventPrimaryTerms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_locationPrimaryTerms_AB_unique" ON "_locationPrimaryTerms"("A", "B");

-- CreateIndex
CREATE INDEX "_locationPrimaryTerms_B_index" ON "_locationPrimaryTerms"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_eventPrimaryTerms_AB_unique" ON "_eventPrimaryTerms"("A", "B");

-- CreateIndex
CREATE INDEX "_eventPrimaryTerms_B_index" ON "_eventPrimaryTerms"("B");

-- AddForeignKey
ALTER TABLE "_locationPrimaryTerms" ADD FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_locationPrimaryTerms" ADD FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eventPrimaryTerms" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eventPrimaryTerms" ADD FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
