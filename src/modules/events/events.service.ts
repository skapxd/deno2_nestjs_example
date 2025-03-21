import { Injectable, Logger } from "@nestjs/common";

import {
  EventContext,
  EventData,
  EventFlowEmitter,
} from "#/src/packages/event-flow-emitter/services/event-flow-emitter.ts";

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly eventEmitter: EventFlowEmitter) {}

  send() {
    this.eventEmitter.emitAsync("send.event", "test");
  }

  add(data: EventData, context: EventContext) {
    this.eventEmitter.emitAsync("send.notification", data, context);
  }

  printEvents(data: any, context: any) {
    // this.logger.log(data, context);
  }
}
