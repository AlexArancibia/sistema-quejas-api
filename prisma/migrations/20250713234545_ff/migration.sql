-- AlterTable
ALTER TABLE "complaints" ALTER COLUMN "id" SET DEFAULT 'SICLO-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8);

-- AlterTable
ALTER TABLE "ratings" ALTER COLUMN "id" SET DEFAULT 'RATING-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8);
