-- CreateTable
CREATE TABLE "LoginActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "kvkId" TEXT,
    "kvkName" TEXT,
    "zoneId" TEXT NOT NULL,
    "activity" TEXT NOT NULL DEFAULT 'Login',
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginActivity_zoneId_idx" ON "LoginActivity"("zoneId");

-- CreateIndex
CREATE INDEX "LoginActivity_kvkId_idx" ON "LoginActivity"("kvkId");

-- CreateIndex
CREATE INDEX "LoginActivity_userId_idx" ON "LoginActivity"("userId");

-- AddForeignKey
ALTER TABLE "LoginActivity" ADD CONSTRAINT "LoginActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginActivity" ADD CONSTRAINT "LoginActivity_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "Kvk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
