-- CreateTable
CREATE TABLE "_CommunityOnMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CommunityOnMembers_AB_unique" ON "_CommunityOnMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_CommunityOnMembers_B_index" ON "_CommunityOnMembers"("B");

-- AddForeignKey
ALTER TABLE "_CommunityOnMembers" ADD FOREIGN KEY ("A") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityOnMembers" ADD FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
