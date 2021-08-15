/*
  Warnings:

  - The `status` column on the `Image` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'FAILEDRETRY', 'ERROR', 'READY', 'TRASHED', 'DELETED');

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "status",
ADD COLUMN     "status" "ImageStatus" NOT NULL DEFAULT E'UPLOADED';

-- CreateIndex
CREATE INDEX "indexImageStatus" ON "Image"("status");
