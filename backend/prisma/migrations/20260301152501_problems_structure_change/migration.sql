-- CreateEnum
CREATE TYPE "ProblemType" AS ENUM ('LESSON', 'PRACTICE', 'HOMEWORK');

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "type" "ProblemType" NOT NULL DEFAULT 'PRACTICE';

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
