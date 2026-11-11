-- AlterTable
ALTER TABLE "LiveRoom" ADD COLUMN     "playbackIsPlaying" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playbackPositionMs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "playbackUpdatedAt" TIMESTAMP(3);
