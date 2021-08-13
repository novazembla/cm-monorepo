-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "heroImageId" INTEGER;

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("heroImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
