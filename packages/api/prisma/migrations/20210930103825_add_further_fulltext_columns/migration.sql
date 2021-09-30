-- AlterTable
ALTER TABLE "Taxonomy" ADD COLUMN     "fullText" TEXT DEFAULT E'';

-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "fullText" TEXT DEFAULT E'';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fullText" TEXT DEFAULT E'';
