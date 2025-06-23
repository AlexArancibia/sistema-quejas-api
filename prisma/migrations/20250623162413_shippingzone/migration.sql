-- DropIndex
DROP INDEX "ShippingMethodPrice_shippingMethodId_currencyId_key";

-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "id" SET DEFAULT 'card_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "CardSection" ALTER COLUMN "id" SET DEFAULT 'cs_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "id" SET DEFAULT 'cat_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "id" SET DEFAULT 'col_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Content" ALTER COLUMN "id" SET DEFAULT 'cnt_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "id" SET DEFAULT 'coup_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Currency" ALTER COLUMN "id" SET DEFAULT 'curr_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ExchangeRate" ALTER COLUMN "id" SET DEFAULT 'exr_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "FrequentlyBoughtTogether" ALTER COLUMN "id" SET DEFAULT 'fbt_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "HeroSection" ALTER COLUMN "id" SET DEFAULT 'hero_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "id" SET DEFAULT 'ord_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "id" SET DEFAULT 'oi_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "PaymentProvider" ALTER COLUMN "id" SET DEFAULT 'pp_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "PaymentTransaction" ALTER COLUMN "id" SET DEFAULT 'pt_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "id" SET DEFAULT 'prod_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "id" SET DEFAULT 'var_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Refund" ALTER COLUMN "id" SET DEFAULT 'ref_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "RefundLineItem" ALTER COLUMN "id" SET DEFAULT 'rli_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ShippingMethod" ADD COLUMN     "maxWeight" DECIMAL(65,30),
ALTER COLUMN "id" SET DEFAULT 'sm_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ShippingMethodPrice" ADD COLUMN     "cityNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "countryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "freeWeightLimit" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "isZoneActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "postalCodePatterns" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "postalCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pricePerKg" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "stateCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "zoneDescription" TEXT,
ADD COLUMN     "zoneName" TEXT,
ADD COLUMN     "zonePriority" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "id" SET DEFAULT 'smp_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ShopSettings" ALTER COLUMN "id" SET DEFAULT 'shop_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "id" SET DEFAULT 'store_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "TeamMember" ALTER COLUMN "id" SET DEFAULT 'tm_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "TeamSection" ALTER COLUMN "id" SET DEFAULT 'team_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT 'user_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "VariantPrice" ALTER COLUMN "id" SET DEFAULT 'vp_' || substr(gen_random_uuid()::text, 1, 13);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL DEFAULT 'country_' || substr(gen_random_uuid()::text, 1, 8),
    "code" TEXT NOT NULL,
    "code3" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "phoneCode" TEXT,
    "currency" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL DEFAULT 'state_' || substr(gen_random_uuid()::text, 1, 8),
    "countryCode" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "type" TEXT NOT NULL DEFAULT 'state',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL DEFAULT 'city_' || substr(gen_random_uuid()::text, 1, 8),
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "postalCode" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code3_key" ON "Country"("code3");

-- CreateIndex
CREATE INDEX "Country_code_idx" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_isActive_idx" ON "Country"("isActive");

-- CreateIndex
CREATE INDEX "State_countryCode_isActive_idx" ON "State"("countryCode", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "State_countryCode_code_key" ON "State"("countryCode", "code");

-- CreateIndex
CREATE INDEX "City_stateId_isActive_idx" ON "City"("stateId", "isActive");

-- CreateIndex
CREATE INDEX "City_name_idx" ON "City"("name");

-- CreateIndex
CREATE INDEX "ShippingMethodPrice_shippingMethodId_currencyId_zonePriorit_idx" ON "ShippingMethodPrice"("shippingMethodId", "currencyId", "zonePriority");

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
