-- AlterTable
ALTER TABLE "Import" ADD COLUMN     "lang" TEXT NOT NULL DEFAULT E'en';

-- AlterTable
ALTER TABLE "LocationExport" ADD COLUMN     "lang" TEXT NOT NULL DEFAULT E'en';
