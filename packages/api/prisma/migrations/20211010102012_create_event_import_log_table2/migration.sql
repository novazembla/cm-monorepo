/*
  Warnings:

  - You are about to drop the column `error` on the `EventImportLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventImportLog" DROP COLUMN "error",
ADD COLUMN     "errors" JSONB DEFAULT E'[]';
