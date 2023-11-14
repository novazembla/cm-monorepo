-- AlterTable
ALTER TABLE "Taxonomy" ADD COLUMN     "hasIcons" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isStolperstein" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "iconKey" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "isStolperstein" BOOLEAN NOT NULL DEFAULT false;
