/*
  Warnings:

  - You are about to drop the column `lastEventEventDate` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "lastEventEventDate",
ADD COLUMN     "lastEventDate" TIMESTAMP(3);
