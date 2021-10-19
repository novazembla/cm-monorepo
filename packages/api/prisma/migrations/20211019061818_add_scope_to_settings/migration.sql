/*
  Warnings:

  - You are about to drop the `Aaa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bbb` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "scope" TEXT NOT NULL DEFAULT E'settings';

-- DropTable
DROP TABLE "Aaa";

-- DropTable
DROP TABLE "Bbb";
