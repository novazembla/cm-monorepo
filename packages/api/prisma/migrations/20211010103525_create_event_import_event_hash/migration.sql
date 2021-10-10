/*
  Warnings:

  - You are about to drop the column `importedEventId` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "importedEventId",
ADD COLUMN     "hash" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "importedEventHash" TEXT;
