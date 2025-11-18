-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[];
