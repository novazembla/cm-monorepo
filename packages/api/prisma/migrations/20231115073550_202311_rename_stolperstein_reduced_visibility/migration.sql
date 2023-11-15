/*
  Warnings:

  - You are about to drop the column `hasStolperstein` on the `Taxonomy` table. All the data in the column will be lost.
  - You are about to drop the column `isStolperstein` on the `Term` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Taxonomy" DROP COLUMN "hasStolperstein",
ADD COLUMN     "hasReducedVisibility" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Term" DROP COLUMN "isStolperstein",
ADD COLUMN     "hasReducedVisibility" BOOLEAN NOT NULL DEFAULT false;
