-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT NOT NULL,
    "senderRole" "AuthLevel" NOT NULL,
    "senderKvkId" TEXT,
    "senderKvkName" TEXT,
    "recipientKvkIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_zoneId_idx" ON "Notification"("zoneId");

-- CreateIndex
CREATE INDEX "Notification_senderId_idx" ON "Notification"("senderId");

-- CreateIndex
CREATE INDEX "Notification_senderKvkId_idx" ON "Notification"("senderKvkId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderKvkId_fkey" FOREIGN KEY ("senderKvkId") REFERENCES "Kvk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
