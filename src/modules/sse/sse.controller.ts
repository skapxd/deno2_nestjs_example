import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  Sse,
} from "@nestjs/common";
import { SseService } from "./sse.service.ts";
import { CronJob } from "cron";
import { Cron, CronExpression } from "@nestjs/schedule";
import type { Request } from "express";
import { ApiOkResponse } from "#/src/utils/decorators/api-response-sse.decorator.ts";
import { NotificationsDto } from "#/src/modules/sse/sse.dto.ts";
import { Events } from "#/src/packages/event-flow-emitter/decorators/events.decorator.ts";

@Controller()
export class SseController {
  constructor(private readonly sseService: SseService) {}

  onModuleInit() {
    new CronJob(CronExpression.EVERY_10_SECONDS, this.cron.bind(this)).start();
  }

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
  @Events({ emit: ["btn"] })
  cron() {
    return this.sseService.cron();
  }

  @Sse(":id")
  sse(@Param("id") id: string, @Req() req: Request, @Res() res) {
    if (typeof req.socket.setNoDelay !== "function") {
      req.socket.setNoDelay = () => {};
    }

    req.on("close", this.sseService.onCloseSse);
    return this.sseService.sse(id, res)
  }
}
