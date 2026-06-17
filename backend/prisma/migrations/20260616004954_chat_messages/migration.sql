/*
  Warnings:

  - You are about to drop the column `seenByIds` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `guestId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderRole` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SenderRole" AS ENUM ('ORGANIZER', 'GUEST');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "seenByIds",
DROP COLUMN "senderId",
ADD COLUMN     "guestId" INTEGER NOT NULL,
ADD COLUMN     "seenByGuest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seenByOrganizer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "senderRole" "SenderRole" NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
