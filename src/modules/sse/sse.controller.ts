import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Sse,
  OnModuleInit,
} from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ApiOkResponse, ApiProduces, ApiResponse } from "@nestjs/swagger";
import type { Request } from "express";
import { CronJob } from "cron";
import { Events } from "#/src/packages/event-flow-emitter/decorators/events.decorator.ts";
import { ApiResponseSSE } from "#/src/utils/decorators/api-response-sse.decorator.ts";

import { CounterDto, NotificationsDto } from "./sse.dto.ts";
import type { SseService } from "./sse.service.ts";

@Controller()
export class SseController /* implements OnModuleInit  */{
  constructor(private readonly sseService: SseService) {}

  // onModuleInit() {
  //   // new CronJob(CronExpression.EVERY_SECOND, this.cron)
  // }

  @Get()
  render(@Query("id") id: string) {
    return this.sseService.render(id);
  }

  @Post()
  btn(@Query("counter") counter: number, @Query("id") id: string) {
    this.sseService.btn(counter, id);
  }

  @ApiOkResponse({ type: NotificationsDto, description: "Notificaciones" })
  @Post("all")
  // @Cron(CronExpression.EVERY_SECOND)
  @Events({ emit: ["btn"] })
  cron() {
    this.sseService.cron();
  }

  @ApiProduces("text/stream")
  @ApiResponse({
    status: 200,
    type: CounterDto,
    description: "Mensaje",
  })
  @ApiResponseSSE({
    event: NotificationsDto.event,
    type: NotificationsDto,
    description: "Notificaciones",
  })
  @Sse(":id")
  sse(@Param("id") id: string, @Req() req: Request) {
    req.on("close", this.sseService.onCloseSse);

    return this.sseService.sse(id);
  }
}
