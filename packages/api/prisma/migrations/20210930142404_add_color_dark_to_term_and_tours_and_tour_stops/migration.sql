-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "visibleFrom" TIMESTAMP(3),
ADD COLUMN     "visibleFromTime" TIMESTAMP(3),
ADD COLUMN     "visibleUntil" TIMESTAMP(3),
ADD COLUMN     "visibleUntilTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Term" ADD COLUMN     "colorDark" TEXT NOT NULL DEFAULT E'';

-- CreateTable
CREATE TABLE "Tour" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "slug" JSONB NOT NULL,
    "duration" JSONB NOT NULL,
    "distance" TEXT NOT NULL,
    "teaser" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "path" JSONB NOT NULL,
    "heroImageId" INTEGER,
    "status" INTEGER NOT NULL,
    "fullText" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourStop" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "number" INTEGER NOT NULL,
    "loactionId" INTEGER NOT NULL,
    "teaser" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "tourId" INTEGER,
    "heroImageId" INTEGER,
    "fullText" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "TourStop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "indexTourOwnerId" ON "Tour"("ownerId");

-- CreateIndex
CREATE INDEX "indexTourStopOwnerId" ON "TourStop"("ownerId");

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourStop" ADD CONSTRAINT "TourStop_loactionId_fkey" FOREIGN KEY ("loactionId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourStop" ADD CONSTRAINT "TourStop_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourStop" ADD CONSTRAINT "TourStop_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourStop" ADD CONSTRAINT "TourStop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
