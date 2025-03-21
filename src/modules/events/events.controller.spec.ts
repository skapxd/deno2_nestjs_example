import { randomUUID } from 'node:crypto';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';

import { promiseFactory } from '#/src/utils/promise-factory';

import { EventsModule } from './events.module';
import { AddEvent } from './events/add.event';
import { AddedEvent } from './events/added.event';

describe('EventsController', () => {
  let event: EventEmitter2;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [EventsModule],
    }).compile();

    event = moduleRef.get<EventEmitter2>(EventEmitter2);

    await moduleRef.init();
  });

  it('should be defined', () => {
    expect(event).toBeDefined();
  });

  it('should receive one event with the result 3 of sum 1 + 2', async () => {
    const { promise, resolve } = promiseFactory<AddedEvent>();

    event.on(AddedEvent.nameEvent, (data) => {
      resolve(data);
    });

    await event.emitAsync(
      AddEvent.nameEvent,
      new AddEvent({
        timestamp: Date.now(),
        traceId: randomUUID(),
        arg1: 1,
        arg2: 2,
      }),
    );

    const resp = await promise;

    expect(resp.result).toBe(3);
  });
});
