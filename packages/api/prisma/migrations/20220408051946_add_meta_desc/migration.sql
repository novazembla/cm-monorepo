-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "metaDesc_de" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "metaDesc_en" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "metaDesc_de" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "metaDesc_en" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "metaDesc_de" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "metaDesc_en" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "metaDesc_de" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "metaDesc_en" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "TourStop" ADD COLUMN     "metaDesc_de" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "metaDesc_en" TEXT NOT NULL DEFAULT E'';
