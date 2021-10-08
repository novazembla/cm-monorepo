-- DropForeignKey
ALTER TABLE "Import" DROP CONSTRAINT "Import_fileId_fkey";

-- AddForeignKey
ALTER TABLE "Import" ADD CONSTRAINT "Import_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
