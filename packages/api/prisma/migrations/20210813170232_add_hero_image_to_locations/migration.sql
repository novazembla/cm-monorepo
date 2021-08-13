-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "heroImageId" INTEGER;

-- AddForeignKey
ALTER TABLE "Location" ADD FOREIGN KEY ("heroImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
