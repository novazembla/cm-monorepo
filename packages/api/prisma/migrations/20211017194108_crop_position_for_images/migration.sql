-- AlterTable
ALTER TABLE "File" ADD COLUMN     "credits_de" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "credits_en" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "title_de" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "title_en" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "cropPosition" INTEGER NOT NULL DEFAULT 0;
