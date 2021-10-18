-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT E'user',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "acceptedTerms" BOOLEAN NOT NULL DEFAULT false,
    "userBanned" BOOLEAN NOT NULL DEFAULT false,
    "ownsEventImports" BOOLEAN NOT NULL DEFAULT false,
    "ownsConentOnDelete" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullText" TEXT DEFAULT E'',
    "profileImageId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "title_de" TEXT NOT NULL DEFAULT E'',
    "slug_de" TEXT NOT NULL DEFAULT E'',
    "description_de" TEXT NOT NULL DEFAULT E'',
    "offers_de" TEXT DEFAULT E'',
    "accessibilityInformation_de" TEXT DEFAULT E'',
    "title_en" TEXT NOT NULL DEFAULT E'',
    "slug_en" TEXT NOT NULL DEFAULT E'',
    "description_en" TEXT NOT NULL DEFAULT E'',
    "offers_en" TEXT DEFAULT E'',
    "accessibilityInformation_en" TEXT DEFAULT E'',
    "address" JSONB DEFAULT E'{}',
    "contactInfo" JSONB DEFAULT E'{}',
    "geoCodingInfo" JSONB DEFAULT E'{}',
    "socialMedia" JSONB DEFAULT E'{}',
    "visibleFrom" TIMESTAMP(3),
    "visibleFromTime" TIMESTAMP(3),
    "visibleUntil" TIMESTAMP(3),
    "visibleUntilTime" TIMESTAMP(3),
    "status" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "fullText" TEXT DEFAULT E'',
    "ownerId" INTEGER NOT NULL,
    "heroImageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventLocationId" INTEGER,
    "agency" TEXT,
    "importedLocationHash" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title_de" TEXT NOT NULL DEFAULT E'',
    "slug_de" TEXT NOT NULL DEFAULT E'',
    "description_de" TEXT NOT NULL DEFAULT E'',
    "title_en" TEXT NOT NULL DEFAULT E'',
    "slug_en" TEXT NOT NULL DEFAULT E'',
    "description_en" TEXT NOT NULL DEFAULT E'',
    "meta" JSONB DEFAULT E'{}',
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "isImported" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "heroImageId" INTEGER,
    "fullText" TEXT DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedEventHash" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDate" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "begin" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "eventId" INTEGER,

    CONSTRAINT "EventDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventImportLog" (
    "id" SERIAL NOT NULL,
    "log" JSONB DEFAULT E'[]',
    "errors" JSONB DEFAULT E'[]',
    "warnings" JSONB DEFAULT E'[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "type" VARCHAR(16) NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(128) NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(12) NOT NULL,
    "name" JSONB NOT NULL,
    "withTaxonomies" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taxonomy" (
    "id" SERIAL NOT NULL,
    "name_de" TEXT NOT NULL DEFAULT E'',
    "slug_de" TEXT NOT NULL DEFAULT E'',
    "name_en" TEXT NOT NULL DEFAULT E'',
    "slug_en" TEXT NOT NULL DEFAULT E'',
    "multiTerm" BOOLEAN NOT NULL DEFAULT false,
    "hasColor" BOOLEAN NOT NULL DEFAULT false,
    "collectPrimaryTerm" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullText" TEXT DEFAULT E'',

    CONSTRAINT "Taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" SERIAL NOT NULL,
    "name_de" TEXT NOT NULL DEFAULT E'',
    "slug_de" TEXT NOT NULL DEFAULT E'',
    "name_en" TEXT NOT NULL DEFAULT E'',
    "slug_en" TEXT NOT NULL DEFAULT E'',
    "color" TEXT NOT NULL DEFAULT E'',
    "colorDark" TEXT NOT NULL DEFAULT E'',
    "taxonomyId" INTEGER NOT NULL,
    "fullText" TEXT DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tour" (
    "id" SERIAL NOT NULL,
    "orderNumber" INTEGER NOT NULL DEFAULT 1,
    "title_de" TEXT NOT NULL DEFAULT E'',
    "slug_de" TEXT NOT NULL DEFAULT E'',
    "duration_de" TEXT NOT NULL DEFAULT E'',
    "distance_de" TEXT NOT NULL DEFAULT E'',
    "teaser_de" TEXT NOT NULL DEFAULT E'',
    "description_de" TEXT NOT NULL DEFAULT E'',
    "title_en" TEXT NOT NULL DEFAULT E'',
    "slug_en" TEXT NOT NULL DEFAULT E'',
    "duration_en" TEXT NOT NULL DEFAULT E'',
    "distance_en" TEXT NOT NULL DEFAULT E'',
    "teaser_en" TEXT NOT NULL DEFAULT E'',
    "description_en" TEXT NOT NULL DEFAULT E'',
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
    "title_de" TEXT NOT NULL DEFAULT E'',
    "teaser_de" TEXT NOT NULL DEFAULT E'',
    "description_de" TEXT NOT NULL DEFAULT E'',
    "title_en" TEXT NOT NULL DEFAULT E'',
    "teaser_en" TEXT NOT NULL DEFAULT E'',
    "description_en" TEXT NOT NULL DEFAULT E'',
    "number" INTEGER DEFAULT 1,
    "loactionId" INTEGER NOT NULL,
    "tourId" INTEGER,
    "heroImageId" INTEGER,
    "fullText" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "TourStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "title_de" TEXT NOT NULL DEFAULT E'',
    "slug_de" TEXT NOT NULL DEFAULT E'',
    "intro_de" TEXT NOT NULL DEFAULT E'',
    "content_de" TEXT NOT NULL DEFAULT E'',
    "title_en" TEXT NOT NULL DEFAULT E'',
    "slug_en" TEXT NOT NULL DEFAULT E'',
    "intro_en" TEXT NOT NULL DEFAULT E'',
    "content_en" TEXT NOT NULL DEFAULT E'',
    "heroImageId" INTEGER,
    "status" INTEGER NOT NULL,
    "fullText" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "nanoid" VARCHAR(48) NOT NULL,
    "meta" JSONB NOT NULL,
    "alt_de" TEXT NOT NULL DEFAULT E'',
    "credits_de" TEXT NOT NULL DEFAULT E'',
    "alt_en" TEXT NOT NULL DEFAULT E'',
    "credits_en" TEXT NOT NULL DEFAULT E'',
    "cropPosition" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,
    "orderNumber" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "type" VARCHAR(16) NOT NULL DEFAULT E'image',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Import" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT E'en',
    "log" JSONB DEFAULT E'[]',
    "errors" JSONB DEFAULT E'[]',
    "mapping" JSONB DEFAULT E'[]',
    "warnings" JSONB DEFAULT E'[]',
    "status" INTEGER NOT NULL DEFAULT 0,
    "fileId" INTEGER,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Import_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataExport" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT E'en',
    "type" TEXT NOT NULL DEFAULT E'location',
    "log" JSONB DEFAULT E'[]',
    "errors" JSONB DEFAULT E'[]',
    "meta" JSONB DEFAULT E'{}',
    "status" INTEGER NOT NULL DEFAULT 0,
    "fileId" INTEGER,
    "ownerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "nanoid" VARCHAR(48) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,
    "title_de" TEXT NOT NULL DEFAULT E'',
    "credits_de" TEXT NOT NULL DEFAULT E'',
    "title_en" TEXT NOT NULL DEFAULT E'',
    "credits_en" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventToLocation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ImageToLocation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_locationTerms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_locationPrimaryTerms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EventToImage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EventToTerm" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_eventPrimaryTerms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ModuleToTaxonomy" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ImageToTourStop" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "indexLocationOwnerId" ON "Location"("ownerId");

-- CreateIndex
CREATE INDEX "indexEventOwnerId" ON "Event"("ownerId");

-- CreateIndex
CREATE INDEX "indexTokenUserId" ON "Token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Module_key_key" ON "Module"("key");

-- CreateIndex
CREATE INDEX "indexTermTaxonomyId" ON "Term"("taxonomyId");

-- CreateIndex
CREATE INDEX "indexTourOwnerId" ON "Tour"("ownerId");

-- CreateIndex
CREATE INDEX "indexTourStopOwnerId" ON "TourStop"("ownerId");

-- CreateIndex
CREATE INDEX "indexPageOwnerId" ON "Page"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_nanoid_key" ON "Image"("nanoid");

-- CreateIndex
CREATE INDEX "indexImageOwnerId" ON "Image"("ownerId");

-- CreateIndex
CREATE INDEX "indexImageOwnerIdType" ON "Image"("ownerId", "type");

-- CreateIndex
CREATE INDEX "indexImageStatus" ON "Image"("status");

-- CreateIndex
CREATE UNIQUE INDEX "File_nanoid_key" ON "File"("nanoid");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToLocation_AB_unique" ON "_EventToLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToLocation_B_index" ON "_EventToLocation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ImageToLocation_AB_unique" ON "_ImageToLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_ImageToLocation_B_index" ON "_ImageToLocation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_locationTerms_AB_unique" ON "_locationTerms"("A", "B");

-- CreateIndex
CREATE INDEX "_locationTerms_B_index" ON "_locationTerms"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_locationPrimaryTerms_AB_unique" ON "_locationPrimaryTerms"("A", "B");

-- CreateIndex
CREATE INDEX "_locationPrimaryTerms_B_index" ON "_locationPrimaryTerms"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToImage_AB_unique" ON "_EventToImage"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToImage_B_index" ON "_EventToImage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToTerm_AB_unique" ON "_EventToTerm"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToTerm_B_index" ON "_EventToTerm"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_eventPrimaryTerms_AB_unique" ON "_eventPrimaryTerms"("A", "B");

-- CreateIndex
CREATE INDEX "_eventPrimaryTerms_B_index" ON "_eventPrimaryTerms"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ModuleToTaxonomy_AB_unique" ON "_ModuleToTaxonomy"("A", "B");

-- CreateIndex
CREATE INDEX "_ModuleToTaxonomy_B_index" ON "_ModuleToTaxonomy"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ImageToTourStop_AB_unique" ON "_ImageToTourStop"("A", "B");

-- CreateIndex
CREATE INDEX "_ImageToTourStop_B_index" ON "_ImageToTourStop"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDate" ADD CONSTRAINT "EventDate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourStop" ADD CONSTRAINT "TourStop_loactionId_fkey" FOREIGN KEY ("loactionId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourStop" ADD CONSTRAINT "TourStop_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourStop" ADD CONSTRAINT "TourStop_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourStop" ADD CONSTRAINT "TourStop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Import" ADD CONSTRAINT "Import_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Import" ADD CONSTRAINT "Import_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExport" ADD CONSTRAINT "DataExport_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExport" ADD CONSTRAINT "DataExport_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToLocation" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToLocation" ADD FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToLocation" ADD FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToLocation" ADD FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_locationTerms" ADD FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_locationTerms" ADD FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_locationPrimaryTerms" ADD FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_locationPrimaryTerms" ADD FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToImage" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToImage" ADD FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToTerm" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToTerm" ADD FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eventPrimaryTerms" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_eventPrimaryTerms" ADD FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToTaxonomy" ADD FOREIGN KEY ("A") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToTaxonomy" ADD FOREIGN KEY ("B") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToTourStop" ADD FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToTourStop" ADD FOREIGN KEY ("B") REFERENCES "TourStop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
