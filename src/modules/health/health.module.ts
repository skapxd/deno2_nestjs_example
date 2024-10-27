import { HealthController } from "./health.controller.ts";
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
