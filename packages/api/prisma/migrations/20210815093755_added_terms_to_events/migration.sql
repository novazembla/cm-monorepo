-- CreateTable
CREATE TABLE "_EventToTerm" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EventToTerm_AB_unique" ON "_EventToTerm"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToTerm_B_index" ON "_EventToTerm"("B");

-- AddForeignKey
ALTER TABLE "_EventToTerm" ADD FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToTerm" ADD FOREIGN KEY ("B") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
