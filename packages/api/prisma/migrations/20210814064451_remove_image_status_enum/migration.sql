/*
  Warnings:

  - The `status` column on the `Image` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "status",
ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "ImageStatus";

-- CreateIndex
CREATE INDEX "indexImageStatus" ON "Image"("status");
