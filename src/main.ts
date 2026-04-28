import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()

  // Dokploy/Traefik is commonly configured to forward to :3000
  const port = Number(process.env.PORT ?? 3000)
  await app.listen(port)
}
bootstrap()


