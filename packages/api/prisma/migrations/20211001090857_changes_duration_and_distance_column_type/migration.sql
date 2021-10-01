/*
  Warnings:

  - Changed the type of `duration` on the `Tour` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `distance` on the `Tour` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "duration",
ADD COLUMN     "duration" JSONB NOT NULL,
DROP COLUMN "distance",
ADD COLUMN     "distance" JSONB NOT NULL;
