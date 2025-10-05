-- DropForeignKey
ALTER TABLE "complaints" DROP CONSTRAINT "complaints_branchId_fkey";

-- AlterTable
ALTER TABLE "complaints" ALTER COLUMN "id" SET DEFAULT 'QUEJA-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8),
ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ratings" ALTER COLUMN "id" SET DEFAULT 'PUNTAJE-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8);

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
