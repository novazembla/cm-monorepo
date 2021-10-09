-- DropForeignKey
ALTER TABLE "EventDate" DROP CONSTRAINT "EventDate_eventId_fkey";

-- AddForeignKey
ALTER TABLE "EventDate" ADD CONSTRAINT "EventDate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
