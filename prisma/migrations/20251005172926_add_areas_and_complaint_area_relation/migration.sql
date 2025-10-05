-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "areaId" TEXT,
ALTER COLUMN "id" SET DEFAULT 'QUEJA-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8);

-- AlterTable
ALTER TABLE "ratings" ALTER COLUMN "id" SET DEFAULT 'PUNTAJE-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#3b82f6',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
