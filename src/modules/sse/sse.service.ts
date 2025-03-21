import { randomUUID } from 'node:crypto';

import { Injectable, Logger,  } from '@nestjs/common';
import { fromEvent, map } from 'rxjs';

import { EventFlowEmitter } from '#/src/packages/event-flow-emitter/services/event-flow-emitter.ts';

import { CounterDto } from './sse.dto.ts';

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private counter = 0;

  constructor(
    private readonly eventEmitter: EventFlowEmitter,
  ) {}

  async cron() {
    this.eventEmitter.emit('btn', { counter: 1, id: null });
  }

  render(uuid?: string) {
    const _uuid = uuid || randomUUID();

    return `
    <button onclick="fn()">this</button>
    <button onclick="fnAll()">all</button>

      <ul></ul>

      <script type="text/javascript">
      function fn() {
        fetch('sse?counter=1000&id=${_uuid}', {
        method: 'POST',
        });
      }

      function fnAll() {
        fetch('sse/all', {
          method: 'POST',
        });
      }

      const ul = document.querySelector('ul')
      const eventSource = new EventSource('/sse/${_uuid}');
      eventSource.onmessage = ({ data }) => {
        const message = document.createElement('li');
        message.innerText = 'New message: ' + data;
        ul.insertBefore(message, ul.firstChild);
      }
      </script>
    `.replace(/  /g, '');
  }

  btn(counter: number, id: string) {
    this.eventEmitter.emit('btn', { counter, id });
    this.logger.log(`${id} - ${counter}`);
    return { counter };
  }

  onCloseSse() {
    this.counter -= 1;
  }

  sse(id: string) {
    return fromEvent(this.eventEmitter, 'btn').pipe(
      map((_: any) => {
        this.counter += _.counter;

        if (_.id === id) {
          return new CounterDto({ counter: this.counter });
        }

        if (_.id === null) {
          return new CounterDto({ counter: this.counter });
        }
      }),
    );
  }
}
