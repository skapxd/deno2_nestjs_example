import { Module } from "@nestjs/common";
import { SseController } from "./sse.controller.ts";
import { SseService } from "./sse.service.ts";
import { ScheduleModule } from "@nestjs/schedule";
import { SchedulerMetadataAccessor } from '@nestjs/schedule/dist/schedule-metadata.accessor.js';
// import { Reflector } from "@nestjs/core";

@Module({
  // imports: [ScheduleModule.forRoot()],
  controllers: [SseController],
  providers: [
    SseService, 
    // Reflector, 
    // SchedulerMetadataAccessor
  ],
})
export class SseModule {}
