-- AlterTable
ALTER TABLE "EventDate" ADD COLUMN     "eventId" INTEGER;

-- AddForeignKey
ALTER TABLE "EventDate" ADD FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
