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
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileImageId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "slug" JSONB NOT NULL,
    "description" JSONB NOT NULL DEFAULT E'{}',
    "address" JSONB DEFAULT E'{}',
    "contactInfo" JSONB DEFAULT E'{}',
    "offers" JSONB DEFAULT E'{}',
    "status" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "fullText" TEXT DEFAULT E'',
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "slug" JSONB NOT NULL,
    "description" JSONB DEFAULT E'{}',
    "eventLocation" JSONB DEFAULT E'{}',
    "locationId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "fullText" TEXT DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
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

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(128) NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(12) NOT NULL,
    "name" JSONB NOT NULL,
    "withTaxonomies" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taxonomy" (
    "id" SERIAL NOT NULL,
    "name" JSONB NOT NULL,
    "slug" JSONB NOT NULL,
    "multiTerm" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" SERIAL NOT NULL,
    "name" JSONB NOT NULL,
    "slug" JSONB NOT NULL,
    "taxonomyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "slug" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "status" INTEGER NOT NULL,
    "fullText" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "uuid" VARCHAR(48) NOT NULL,
    "meta" JSONB NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "type" VARCHAR(16) NOT NULL DEFAULT E'image',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ImageToLocation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_LocationToTerm" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EventToImage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ModuleToTaxonomy" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE INDEX "indexLocationOwnerId" ON "Location"("ownerId");

-- CreateIndex
CREATE INDEX "indexEventOwnerId" ON "Event"("ownerId");

-- CreateIndex
CREATE INDEX "indexTokenUserId" ON "Token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting.key_unique" ON "Setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Module.key_unique" ON "Module"("key");

-- CreateIndex
CREATE INDEX "indexTermTaxonomyId" ON "Term"("taxonomyId");

-- CreateIndex
CREATE INDEX "indexPageOwnerId" ON "Page"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Image.uuid_unique" ON "Image"("uuid");

-- CreateIndex
CREATE INDEX "indexImageOwnerId" ON "Image"("ownerId");

-- CreateIndex
CREATE INDEX "indexImageOwnerIdType" ON "Image"("ownerId", "type");

-- CreateIndex
CREATE INDEX "indexImageStatus" ON "Image"("status");

-- CreateIndex
CREATE UNIQUE INDEX "_ImageToLocation_AB_unique" ON "_ImageToLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_ImageToLocation_B_index" ON "_ImageToLocation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LocationToTerm_AB_unique" ON "_LocationToTerm"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationToTerm_B_index" ON "_LocationToTerm"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToImage_AB_unique" ON "_EventToImage"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToImage_B_index" ON "_EventToImage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ModuleToTaxonomy_AB_unique" ON "_ModuleToTaxonomy"("A", "B");

-- CreateIndex
CREATE INDEX "_ModuleToTaxonomy_B_index" ON "_ModuleToTaxonomy"("B");

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("profileImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD FOREIGN KEY ("taxonomyId") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToLocation" ADD FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToLocation" ADD FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToTerm" ADD FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToTerm" ADD FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToImage" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToImage" ADD FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToTaxonomy" ADD FOREIGN KEY ("A") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToTaxonomy" ADD FOREIGN KEY ("B") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
