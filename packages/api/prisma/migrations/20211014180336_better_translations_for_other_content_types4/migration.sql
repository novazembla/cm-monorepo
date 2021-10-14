/*
  Warnings:

  - You are about to drop the column `description` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `intro` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Taxonomy` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Taxonomy` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Term` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Term` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `distance` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `teaser` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `TourStop` table. All the data in the column will be lost.
  - You are about to drop the column `teaser` on the `TourStop` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `TourStop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "description",
DROP COLUMN "slug",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "Page" DROP COLUMN "content",
DROP COLUMN "intro",
DROP COLUMN "slug",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "Taxonomy" DROP COLUMN "name",
DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Term" DROP COLUMN "name",
DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "description",
DROP COLUMN "distance",
DROP COLUMN "duration",
DROP COLUMN "slug",
DROP COLUMN "teaser",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "TourStop" DROP COLUMN "description",
DROP COLUMN "teaser",
DROP COLUMN "title";
