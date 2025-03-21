import { Module } from "@nestjs/common";
// import { ScheduleModule } from "@nestjs/schedule";
import { SchedulerMetadataAccessor } from "@nestjs/schedule/dist/schedule-metadata.accessor.js";
import { SchedulerOrchestrator } from "@nestjs/schedule/dist/scheduler.orchestrator.js";

import { SseController } from "./sse.controller.ts";
import { SseService } from "./sse.service.ts";

@Module({
  // imports: [ScheduleModule.forRoot()],
  controllers: [SseController],
  providers: [SseService, SchedulerMetadataAccessor, SchedulerOrchestrator],
})
export class SseModule {}
