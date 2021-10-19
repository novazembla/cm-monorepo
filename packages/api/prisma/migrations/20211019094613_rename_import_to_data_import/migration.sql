/*
  Warnings:

  - You are about to drop the `Import` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Import" DROP CONSTRAINT "Import_fileId_fkey";

-- DropForeignKey
ALTER TABLE "Import" DROP CONSTRAINT "Import_ownerId_fkey";

-- DropTable
DROP TABLE "Import";

-- CreateTable
CREATE TABLE "DataImport" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT E'en',
    "type" TEXT NOT NULL DEFAULT E'location',
    "log" JSONB DEFAULT E'[]',
    "errors" JSONB DEFAULT E'[]',
    "mapping" JSONB DEFAULT E'[]',
    "warnings" JSONB DEFAULT E'[]',
    "status" INTEGER NOT NULL DEFAULT 0,
    "fileId" INTEGER,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataImport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DataImport" ADD CONSTRAINT "DataImport_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataImport" ADD CONSTRAINT "DataImport_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
