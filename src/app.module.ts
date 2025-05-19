import { Module } from "@nestjs/common"
import { PrismaModule } from "./prisma/prisma.module"
import { CategoryModule } from "./category/category.module"
import { AuthModule } from "./auth/auth.module"
import { FileModule } from "./file/file.module"
import { MulterModule } from "@nestjs/platform-express"
import { join } from "path"
import { FILE_UPLOADS_DIR } from "lib/constants"
import { ServeStaticModule } from "@nestjs/serve-static"
import { CollectionModule } from "./collection/collection.module"
import { CurrencyModule } from "./currency/currency.module"
import { ExchangeRateModule } from "./exchange-rate/exchange-rate.module"
import { ProductModule } from "./product/product.module"
import { PaymentTransactionModule } from "./payment-transaction/payment-transaction.module"
import { CouponModule } from "./coupon/coupon.module"
import { RefundModule } from "./refund/refund.module"
import { OrderModule } from "./order/order.module"
import { ContentModule } from "./content/content.module"
import { HeroSectionModule } from "./hero-section/hero-section.module"
import { ConfigModule } from "@nestjs/config"
import { EmailModule } from "./email/email.module"
import { StoreModule } from "./store/store.module"
import { ShippingMethodsModule } from "./shipping-methods/shipping-methods.module"
import { PaymentProvidersModule } from "./payment-providers/payment-providers.module"
import { CardSectionModule } from './card-section/card-section.module';
import { TeamSectionModule } from './team-section/team-section.module';
import { ShopModule } from "./shop/shop.module"
import { FrequentlyBoughtTogetherModule } from './fbt/fbt.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "files"), // Asegúrate de que la carpeta sea correcta
      serveRoot: "/uploads", // La URL base para acceder a las imágenes
    }),
    PrismaModule,
    CategoryModule,
    AuthModule,
    FileModule,
    MulterModule.register({
      dest: FILE_UPLOADS_DIR,
      limits: {
        fileSize: 1000 * 1000 * 10, // 10MB
      },
    }),
    CollectionModule,
    CurrencyModule,
    StoreModule,
    ExchangeRateModule,
    ShopModule,
    ProductModule,
    ShippingMethodsModule,
    PaymentProvidersModule,
    PaymentTransactionModule,
    CouponModule,
    RefundModule,
    OrderModule,
    ContentModule,
    HeroSectionModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    EmailModule,
    CardSectionModule,
    TeamSectionModule,
    FrequentlyBoughtTogetherModule,
  ],
})
export class AppModule {}
