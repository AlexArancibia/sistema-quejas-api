/*
  Warnings:

  - You are about to drop the column `branchId` on the `instructors` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "instructors" DROP CONSTRAINT "instructors_branchId_fkey";

-- AlterTable
ALTER TABLE "complaints" ALTER COLUMN "id" SET DEFAULT 'QUEJA-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8);

-- AlterTable
ALTER TABLE "instructors" DROP COLUMN "branchId";

-- AlterTable
ALTER TABLE "ratings" ALTER COLUMN "id" SET DEFAULT 'PUNTAJE-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8);
