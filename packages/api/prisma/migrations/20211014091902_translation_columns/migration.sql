-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "address_de" TEXT DEFAULT E'',
ADD COLUMN     "address_en" TEXT DEFAULT E'',
ADD COLUMN     "description_de" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "description_en" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "offers_de" TEXT DEFAULT E'',
ADD COLUMN     "offers_en" TEXT DEFAULT E'',
ADD COLUMN     "slug_de" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "slug_en" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "title_de" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "title_en" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "title" SET DEFAULT E'{}',
ALTER COLUMN "slug" SET DEFAULT E'{}';

-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "orderNumber" INTEGER NOT NULL DEFAULT 1;
