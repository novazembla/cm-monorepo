-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ownsConentOnDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownsEventImports" BOOLEAN NOT NULL DEFAULT false;
