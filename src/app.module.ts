import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";

import { DataModule } from "./modules/data/data.module.ts";
import { HealthModule } from "./modules/health/health.module.ts";
import { IndexModule } from "./modules/index/index.module.ts";
import { EventFlowEmitterModule } from "./packages/event-flow-emitter/event-emitter.module.ts";
import { EventsModule } from "#/src/modules/events/events.module.ts";
import { SseModule } from "#/src/modules/sse/sse.module.ts";

@Module({
  imports: [
    EventFlowEmitterModule.forRoot({
      delimiter: ".",
      wildcard: true,
      global: true,
      verboseMemoryLeak: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    IndexModule,
    HealthModule,
    DataModule,
    EventsModule,
    // SseModule,
    RouterModule.register([
      {
        path: "/",
        module: IndexModule,
      },
      {
        path: "/health",
        module: HealthModule,
      },
      {
        path: "/data",
        module: DataModule,
      },
      {
        path: "/events",
        module: EventsModule,
      },
      // {
      //   path: "/sse",
      //   module: SseModule,
      // },
    ]),
  ],
})
export class AppModule {}
