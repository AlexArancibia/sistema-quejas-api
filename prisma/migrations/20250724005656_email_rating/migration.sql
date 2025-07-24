-- AlterTable
ALTER TABLE "complaints" ALTER COLUMN "id" SET DEFAULT 'QUEJA-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8);

-- AlterTable
ALTER TABLE "ratings" ADD COLUMN     "email" TEXT,
ADD COLUMN     "fullName" TEXT,
ALTER COLUMN "id" SET DEFAULT 'PUNTAJE-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8);
