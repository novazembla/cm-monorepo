/*
  Warnings:

  - You are about to drop the column `locationId` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_locationId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "locationId";

-- CreateTable
CREATE TABLE "_EventToLocation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EventToLocation_AB_unique" ON "_EventToLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToLocation_B_index" ON "_EventToLocation"("B");

-- AddForeignKey
ALTER TABLE "_EventToLocation" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToLocation" ADD FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
