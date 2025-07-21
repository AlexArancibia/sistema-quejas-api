import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from "@nestjs-modules/mailer"
import { EmailController } from './email.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule, // Make sure ConfigModule is imported
    PrismaModule, // Add PrismaModule for database access
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get("MAIL_HOST"),
          port: configService.get("MAIL_PORT"),
          secure: true,
          auth: {
            user: configService.get("MAIL_USER"),
            pass: configService.get("MAIL_PASSWORD"),
          },
        },
        defaults: {
          from: `"${configService.get("MAIL_FROM_NAME", "Ecommerce")}" <${configService.get("MAIL_FROM_ADDRESS", "contacto@maintech.com.pe")}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService, ConfigService], // Make sure ConfigService is provided
  exports: [EmailService],
})
export class EmailModule {}
