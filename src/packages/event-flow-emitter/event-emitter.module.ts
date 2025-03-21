import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { EventEmitterModuleOptions } from './interfaces/event-emitter-options.interface.ts';
import { EventEmitterReadinessWatcher } from './services/event-emitter-readiness.watcher.ts';
import { EventFlowEmitter } from './services/event-flow-emitter.ts';
import { EventParamsFactory } from './services/event-params-factory.ts';
import { EventSubscribersLoader } from './services/event-subscribers.loader.ts';
import { EventsMetadataAccessor } from './services/events-metadata.accessor.ts';

@Module({})
export class EventFlowEmitterModule {
  static forRoot(options?: EventEmitterModuleOptions): DynamicModule {
    return {
      global: options?.global ?? true,
      module: EventFlowEmitterModule,
      imports: [DiscoveryModule],
      providers: [
        EventSubscribersLoader,
        EventsMetadataAccessor,
        EventEmitterReadinessWatcher,
        EventParamsFactory,
        {
          provide: EventFlowEmitter,
          useFactory: () => new EventFlowEmitter(options),
        },
      ],
      exports: [
        EventFlowEmitter,
        EventEmitterReadinessWatcher,
        EventParamsFactory,
      ],
    };
  }
}
