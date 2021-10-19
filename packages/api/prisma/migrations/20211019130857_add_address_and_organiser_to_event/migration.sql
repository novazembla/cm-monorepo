/*
  Warnings:

  - You are about to drop the `EventImportLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "address" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "organiser" TEXT NOT NULL DEFAULT E'';

-- DropTable
DROP TABLE "EventImportLog";
