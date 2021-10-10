-- CreateTable
CREATE TABLE "EventImportLog" (
    "id" SERIAL NOT NULL,
    "log" JSONB DEFAULT E'[]',
    "error" JSONB DEFAULT E'[]',
    "warnings" JSONB DEFAULT E'[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventImportLog_pkey" PRIMARY KEY ("id")
);
