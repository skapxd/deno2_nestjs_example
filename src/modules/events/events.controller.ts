import { Controller, Post } from '@nestjs/common';

import {
  EventBody,
  EventCtx,
} from '#/src/packages/event-flow-emitter/decorators/event-param.decorator.ts';
import { Events } from '#/src/packages/event-flow-emitter/decorators/events.decorator.ts';
import type {
  EventContext,
  EventData,
} from '#/src/packages/event-flow-emitter/services/event-flow-emitter.ts';

import { EventsService } from './events.service.ts';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Events({ emit: ['send.event'] })
  @Post('send-v1')
  sendEventV1() {
    this.eventsService.send();
  }

  @Events({ emit: ['send.event'] })
  @Post('send-v2')
  sendEventV2() {
    this.eventsService.send();
  }

  @Events({
    listen: ['send.event'],
    emit: ['send.notification'],
  })
  async handleAddEvent(
    @EventCtx() ctx: EventContext,
    @EventBody() props: EventData,
  ) {
    return await this.eventsService.add(props, ctx);
  }

  @Events({ listen: ['send.*'] })
  async handleAllSendEvents(
    @EventBody() props: EventData,
    @EventCtx() ctx: EventContext,
  ) {
    this.eventsService.printEvents(props, ctx);
  }
}
