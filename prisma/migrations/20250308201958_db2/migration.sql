/*
  Warnings:

  - The values [CREDIT_CARD] on the enum `PaymentProviderType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentProviderType_new" AS ENUM ('PAYPAL', 'STRIPE', 'MERCADOPAGO', 'BANK_TRANSFER', 'CASH_ON_DELIVERY', 'OTHER');
ALTER TABLE "PaymentProvider" ALTER COLUMN "type" TYPE "PaymentProviderType_new" USING ("type"::text::"PaymentProviderType_new");
ALTER TYPE "PaymentProviderType" RENAME TO "PaymentProviderType_old";
ALTER TYPE "PaymentProviderType_new" RENAME TO "PaymentProviderType";
DROP TYPE "PaymentProviderType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "id" SET DEFAULT 'addr_' || substr(gen_random_uuid()::text, 1, 13);

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
ALTER TABLE "Customer" ALTER COLUMN "id" SET DEFAULT 'cu_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ExchangeRate" ALTER COLUMN "id" SET DEFAULT 'exr_' || substr(gen_random_uuid()::text, 1, 13);

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
ALTER TABLE "ShippingMethod" ALTER COLUMN "id" SET DEFAULT 'sm_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ShippingMethodPrice" ALTER COLUMN "id" SET DEFAULT 'smp_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "ShopSettings" ALTER COLUMN "id" SET DEFAULT 'shop_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT 'user_' || substr(gen_random_uuid()::text, 1, 13);

-- AlterTable
ALTER TABLE "VariantPrice" ALTER COLUMN "id" SET DEFAULT 'vp_' || substr(gen_random_uuid()::text, 1, 13);
