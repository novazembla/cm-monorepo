-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "accessibilityInformation" JSONB DEFAULT E'{}',
ADD COLUMN     "socialMedia" JSONB DEFAULT E'{}';
