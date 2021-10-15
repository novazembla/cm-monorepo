-- CreateTable
CREATE TABLE "LocationExport" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "log" JSONB DEFAULT E'[]',
    "errors" JSONB DEFAULT E'[]',
    "meta" JSONB DEFAULT E'{}',
    "status" INTEGER NOT NULL DEFAULT 0,
    "fileId" INTEGER,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationExport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LocationExport" ADD CONSTRAINT "LocationExport_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationExport" ADD CONSTRAINT "LocationExport_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
