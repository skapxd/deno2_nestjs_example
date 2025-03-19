import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.ts";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger(bootstrap.name);

  const openApiConfig = new DocumentBuilder()
    .setTitle("Deno 2 - NestJS -- Example API")
    .setDescription("The Deno 2 - NestJS -- Example API documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);

  const url = await app.getUrl();

  logger.log(`Server is running in ${url}`);
}
bootstrap();
