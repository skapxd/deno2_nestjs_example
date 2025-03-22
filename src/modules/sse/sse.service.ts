import { randomUUID } from "node:crypto";

import { Injectable, Logger } from "@nestjs/common";

import { EventFlowEmitter } from "#/src/packages/event-flow-emitter/services/event-flow-emitter.ts";
import { fromEvent } from "rxjs";
import { map } from "rxjs";
import { CounterDto } from "#/src/modules/sse/sse.dto.ts";

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private counter = 0;

  constructor(private readonly eventEmitter: EventFlowEmitter) {}

  async cron() {
    this.eventEmitter.emit("btn", { counter: 1, id: null });
  }

  render(uuid?: string) {
    const _uuid = uuid || randomUUID();

    return `
    <button onclick="fn()">this</button>
    <button onclick="fnAll()">all</button>

      <ul></ul>

      <script type="text/javascript">
      let sseWorker;
      let workerPort;
      
      // Initialize the SharedWorker
      function initSharedWorker() {
        try {
          sseWorker = new SharedWorker('/sse-worker.js');
          workerPort = sseWorker.port;
          
          // Start the worker
          workerPort.start();
          
          // Send the UUID to initialize SSE connection
          workerPort.postMessage({
            type: 'init',
            uuid: '${_uuid}'
          });
          
          // Handle messages from the worker
          workerPort.onmessage = function(e) {
            const messageData = e.data;
            
            if (messageData.type === 'message') {
              const message = document.createElement('li');
              message.innerText = 'New message: ' + messageData.data;
              ul.insertBefore(message, ul.firstChild);
            } else if (messageData.type === 'error') {
              console.error(messageData.data);
            } else if (messageData.type === 'connected') {
              console.log(messageData.data);
            }
          };
          
          // Handle page unload to properly close the connection
          window.addEventListener('beforeunload', () => {
            if (workerPort) {
              workerPort.close();
            }
          });
        } catch (e) {
          console.error('SharedWorker not supported, falling back to direct EventSource', e);
          fallbackToDirectSSE();
        }
      }
      
      // Fallback to direct EventSource if SharedWorker is not supported
      function fallbackToDirectSSE() {
        const eventSource = new EventSource('/sse/${_uuid}');
        eventSource.onmessage = ({ data }) => {
          const message = document.createElement('li');
          message.innerText = 'New message (direct): ' + data;
          ul.insertBefore(message, ul.firstChild);
        }
      }
      
      function fn() {
        if (workerPort) {
          workerPort.postMessage({
            type: 'fetch',
            url: 'sse?counter=1000&id=${_uuid}',
            method: 'POST'
          });
        } else {
          fetch('sse?counter=1000&id=${_uuid}', {
            method: 'POST',
          });
        }
      }

      function fnAll() {
        if (workerPort) {
          workerPort.postMessage({
            type: 'fetch',
            url: 'sse/all',
            method: 'POST'
          });
        } else {
          fetch('sse/all', {
            method: 'POST',
          });
        }
      }

      const ul = document.querySelector('ul');
      
      // Check if SharedWorker is supported
      if (typeof SharedWorker !== 'undefined') {
        initSharedWorker();
      } else {
        fallbackToDirectSSE();
      }
      </script>
    `.replace(/  /g, "");
  }

  btn(counter: number, id: string) {
    this.eventEmitter.emit("btn", { counter, id });
    this.logger.log(`${id} - ${counter}`);
    return { counter };
  }

  onCloseSse() {
    this.counter -= 1;
  }

  sse(id: string, req: any) {
    return fromEvent(this.eventEmitter, "btn").pipe(
      map((_: any) => {
        const [one, two, ...other] = _;
        this.counter += +one.counter;

        const message = new CounterDto({ counter: this.counter }).toString();

        // Send to specific client or broadcast to all
        if (one.id === id || one.id === null) {
          return { data: JSON.stringify({ counter: this.counter }) };
        }
        
        return undefined; // Don't send to other clients
      })
    );
  }
}
