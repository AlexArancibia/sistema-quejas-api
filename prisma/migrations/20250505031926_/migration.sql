/*
  Warnings:

  - You are about to drop the column `billingAddressId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerMetadata` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddressId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `fbt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[storeId,slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,slug]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,slug]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,code]` on the table `Coupon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,code]` on the table `Currency` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId]` on the table `ShopSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Collection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Currency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `HeroSection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerInfo` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `PaymentProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `ShippingMethod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `ShopSettings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'FACEBOOK', 'TWITTER', 'APPLE', 'GITHUB', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_billingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_shippingAddressId_fkey";

-- DropIndex
DROP INDEX "Category_slug_key";

-- DropIndex
DROP INDEX "Collection_slug_key";

-- DropIndex
DROP INDEX "Content_slug_key";

-- DropIndex
DROP INDEX "Coupon_code_key";

-- DropIndex
DROP INDEX "Currency_code_key";

-- DropIndex
DROP INDEX "Order_orderNumber_customerId_financialStatus_fulfillmentSta_idx";

-- DropIndex
DROP INDEX "Product_slug_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "storeId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT 'cat_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "storeId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT 'col_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "storeId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT 'cnt_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "storeId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT 'coup_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Currency" ADD COLUMN     "autoUpdateRates" BOOLEAN,
ADD COLUMN     "roundingPrecision" INTEGER,
ADD COLUMN     "storeId" TEXT NOT NULL,
ADD COLUMN     "updateFrequency" TEXT,
ALTER COLUMN "id" SET DEFAULT 'curr_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ExchangeRate" ALTER COLUMN "id" SET DEFAULT 'exr_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "HeroSection" ADD COLUMN     "storeId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT 'hero_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "billingAddressId",
DROP COLUMN "customerId",
DROP COLUMN "customerMetadata",
DROP COLUMN "shippingAddressId",
ADD COLUMN     "billingAddress" JSONB,
ADD COLUMN     "customerInfo" JSONB NOT NULL,
ADD COLUMN     "shippingAddress" JSONB,
ADD COLUMN     "storeId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT 'ord_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "id" SET DEFAULT 'oi_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "PaymentProvider" ADD COLUMN     "imgUrl" TEXT,
ADD COLUMN     "maximumAmount" DECIMAL(65,30),
ADD COLUMN     "minimumAmount" DECIMAL(65,30),
ADD COLUMN     "storeId" TEXT NOT NULL,
ADD COLUMN     "testMode" BOOLEAN,
ALTER COLUMN "id" SET DEFAULT 'pp_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "PaymentTransaction" ALTER COLUMN "id" SET DEFAULT 'pt_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "fbt",
ADD COLUMN     "restockNotify" BOOLEAN,
ADD COLUMN     "restockThreshold" INTEGER,
ADD COLUMN     "storeId" TEXT NOT NULL,
ADD COLUMN     "viewCount" INTEGER,
ALTER COLUMN "id" SET DEFAULT 'prod_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "id" SET DEFAULT 'var_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Refund" ALTER COLUMN "id" SET DEFAULT 'ref_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "RefundLineItem" ALTER COLUMN "id" SET DEFAULT 'rli_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ShippingMethod" ADD COLUMN     "storeId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT 'sm_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ShippingMethodPrice" ALTER COLUMN "id" SET DEFAULT 'smp_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ShopSettings" ADD COLUMN     "ccpaCompliant" BOOLEAN,
ADD COLUMN     "cookieConsentEnabled" BOOLEAN,
ADD COLUMN     "enableWishlist" BOOLEAN,
ADD COLUMN     "gdprCompliant" BOOLEAN,
ADD COLUMN     "storeId" TEXT NOT NULL,
ADD COLUMN     "webhooks" JSONB,
ALTER COLUMN "id" SET DEFAULT 'shop_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "authProviderId" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "failedLoginAttempts" INTEGER,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3),
ALTER COLUMN "id" SET DEFAULT 'user_' || substr(gen_random_uuid()::text, 1, 13),
ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VariantPrice" ALTER COLUMN "id" SET DEFAULT 'vp_' || substr(gen_random_uuid()::text, 1, 13);

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "Customer";

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL DEFAULT 'store_' || substr(gen_random_uuid()::text, 1, 13),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxProducts" INTEGER,
    "planType" TEXT,
    "planExpiryDate" TIMESTAMP(3),
    "apiKeys" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrequentlyBoughtTogether" (
    "id" TEXT NOT NULL DEFAULT 'fbt_' || substr(gen_random_uuid()::text, 1, 13),
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discountName" TEXT,
    "discount" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrequentlyBoughtTogether_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardSection" (
    "id" TEXT NOT NULL DEFAULT 'cs_' || substr(gen_random_uuid()::text, 1, 13),
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "layout" TEXT,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "maxCards" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "styles" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL DEFAULT 'card_' || substr(gen_random_uuid()::text, 1, 13),
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "linkText" TEXT,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "cardSectionId" TEXT NOT NULL,
    "styles" JSONB,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamSection" (
    "id" TEXT NOT NULL DEFAULT 'team_' || substr(gen_random_uuid()::text, 1, 13),
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "layout" TEXT,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "styles" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL DEFAULT 'tm_' || substr(gen_random_uuid()::text, 1, 13),
    "teamSectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "imageUrl" TEXT,
    "bio" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FrequentlyBoughtTogetherToProductVariant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FrequentlyBoughtTogetherToProductVariant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FrequentlyBoughtTogether_storeId_name_key" ON "FrequentlyBoughtTogether"("storeId", "name");

-- CreateIndex
CREATE INDEX "_FrequentlyBoughtTogetherToProductVariant_B_index" ON "_FrequentlyBoughtTogetherToProductVariant"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Category_storeId_slug_key" ON "Category"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_storeId_slug_key" ON "Collection"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Content_storeId_slug_key" ON "Content"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_storeId_code_key" ON "Coupon"("storeId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_storeId_code_key" ON "Currency"("storeId", "code");

-- CreateIndex
CREATE INDEX "Order_financialStatus_fulfillmentStatus_idx" ON "Order"("financialStatus", "fulfillmentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Order_storeId_orderNumber_key" ON "Order"("storeId", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Product_storeId_slug_key" ON "Product"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSettings_storeId_key" ON "ShopSettings"("storeId");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopSettings" ADD CONSTRAINT "ShopSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrequentlyBoughtTogether" ADD CONSTRAINT "FrequentlyBoughtTogether_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingMethod" ADD CONSTRAINT "ShippingMethod_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProvider" ADD CONSTRAINT "PaymentProvider_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSection" ADD CONSTRAINT "HeroSection_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardSection" ADD CONSTRAINT "CardSection_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_cardSectionId_fkey" FOREIGN KEY ("cardSectionId") REFERENCES "CardSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSection" ADD CONSTRAINT "TeamSection_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamSectionId_fkey" FOREIGN KEY ("teamSectionId") REFERENCES "TeamSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FrequentlyBoughtTogetherToProductVariant" ADD CONSTRAINT "_FrequentlyBoughtTogetherToProductVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "FrequentlyBoughtTogether"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FrequentlyBoughtTogetherToProductVariant" ADD CONSTRAINT "_FrequentlyBoughtTogetherToProductVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
