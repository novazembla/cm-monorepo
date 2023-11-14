/*
  Warnings:

  - You are about to drop the column `isStolperstein` on the `Taxonomy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Taxonomy" DROP COLUMN "isStolperstein",
ADD COLUMN     "hasStolperstein" BOOLEAN NOT NULL DEFAULT false;
