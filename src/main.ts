import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module.ts";
import { extractEventsDocumentation } from "#/src/packages/event-flow-emitter/utils/documentation-helper.ts";

const logger = new Logger("Start");
const app = await NestFactory.create(AppModule);

const openApiConfig = new DocumentBuilder()
  .setTitle("Deno 2 - NestJS -- Example API")
  .setDescription("The Deno 2 - NestJS -- Example API documentation")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, openApiConfig);
SwaggerModule.setup("api", app, document);

// await extractEventsDocumentation(app);

await app.listen(3000);

const url = await app.getUrl();

logger.log(`Server is running in ${url}`);
