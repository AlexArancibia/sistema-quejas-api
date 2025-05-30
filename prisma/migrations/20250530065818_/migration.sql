/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `ProductVariant` table. All the data in the column will be lost.

*/
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
ALTER TABLE "ProductVariant" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[],
ALTER COLUMN "id" SET DEFAULT 'var_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "Refund" ALTER COLUMN "id" SET DEFAULT 'ref_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "RefundLineItem" ALTER COLUMN "id" SET DEFAULT 'rli_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ShippingMethod" ALTER COLUMN "id" SET DEFAULT 'sm_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ShippingMethodPrice" ALTER COLUMN "id" SET DEFAULT 'smp_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ShopSettings" ADD COLUMN     "footerDescription" TEXT,
ALTER COLUMN "id" SET DEFAULT 'shop_' || substr(gen_random_uuid()::text, 1, 13);

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
