-- Deleting a User must still work even if they've logged in before (the
-- normal case) - LoginActivity.userId becomes nullable and SET NULL on
-- delete instead of RESTRICT, which was blocking every real delete of an
-- account with any login history. `username` is already denormalized on
-- this table, so the row stays fully readable afterward.

-- DropForeignKey
ALTER TABLE "LoginActivity" DROP CONSTRAINT "LoginActivity_userId_fkey";

-- AlterTable
ALTER TABLE "LoginActivity" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LoginActivity" ADD CONSTRAINT "LoginActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
