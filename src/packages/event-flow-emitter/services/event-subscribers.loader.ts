import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  ContextIdFactory,
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
} from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector.js';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper.js';
import { Module } from '@nestjs/core/injector/module.js';

import {
  EVENT_PARAM_TYPE,
  ROUTE_ARGS_METADATA,
} from '../decorators/event-param.decorator.ts';
import { EventPayloadHost } from '../interfaces/event-payload-host.interface.ts';
import { OnEventOptions } from '../interfaces/on-event-options.interface.ts';
import { EventEmitterReadinessWatcher } from './event-emitter-readiness.watcher.ts';
import { EventFlowEmitter } from './event-flow-emitter.ts';
import { EventParamsFactory } from './event-params-factory.ts';
import { EventsMetadataAccessor } from './events-metadata.accessor.ts';

@Injectable()
export class EventSubscribersLoader
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly injector = new Injector();
  private readonly logger = new Logger('Event');
  private readonly eventParamsFactory: EventParamsFactory;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly eventEmitter: EventFlowEmitter,
    private readonly metadataAccessor: EventsMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
    private readonly eventEmitterReadinessWatcher: EventEmitterReadinessWatcher,
  ) {
    this.eventParamsFactory = new EventParamsFactory();
  }

  onApplicationBootstrap() {
    try {
      this.loadEventListeners();
      this.eventEmitterReadinessWatcher.setReady();
    } catch (e) {
      this.eventEmitterReadinessWatcher.setErrored(e as Error);
    }
  }

  onApplicationShutdown() {
    this.eventEmitter.removeAllListeners();
  }

  loadEventListeners() {
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();
    [...providers, ...controllers]
      .filter((wrapper) => wrapper.instance && !wrapper.isAlias)
      .forEach((wrapper: InstanceWrapper) => {
        const { instance } = wrapper;
        const prototype = Object.getPrototypeOf(instance) || {};
        const isRequestScoped = !wrapper.isDependencyTreeStatic();
        this.metadataScanner.scanFromPrototype(
          instance,
          prototype,
          (methodKey: string) =>
            this.subscribeToEventIfListener(
              instance,
              methodKey,
              isRequestScoped,
              wrapper.host as Module,
            ),
        );
      });
  }

  private subscribeToEventIfListener(
    instance: Record<string, any>,
    methodKey: string,
    isRequestScoped: boolean,
    moduleRef: Module,
  ) {
    const eventListenerMetadatas =
      this.metadataAccessor.getEventHandlerMetadata(instance[methodKey]);
    if (!eventListenerMetadatas) {
      return;
    }

    for (const eventListenerMetadata of eventListenerMetadatas) {
      const { event, options } = eventListenerMetadata;
      const listenerMethod = this.getRegisterListenerMethodBasedOn(options);

      if (isRequestScoped) {
        this.registerRequestScopedListener({
          event,
          eventListenerInstance: instance,
          listenerMethod,
          listenerMethodKey: methodKey,
          moduleRef,
          options,
        });
      } else {
        listenerMethod(
          event,
          (...args: unknown[]) =>
            this.wrapFunctionInTryCatchBlocks(
              instance,
              methodKey,
              args,
              options,
            ),
          options,
        );
      }
    }
  }

  private getRegisterListenerMethodBasedOn(options?: OnEventOptions) {
    return options?.prependListener
      ? this.eventEmitter.prependListener.bind(this.eventEmitter)
      : this.eventEmitter.on.bind(this.eventEmitter);
  }

  private registerRequestScopedListener(eventListenerContext: {
    listenerMethod: EventFlowEmitter['on'];
    event: string | symbol | (string | symbol)[];
    eventListenerInstance: Record<string, any>;
    moduleRef: Module;
    listenerMethodKey: string;
    options?: OnEventOptions;
  }) {
    const {
      listenerMethod,
      event,
      eventListenerInstance,
      moduleRef,
      listenerMethodKey,
      options,
    } = eventListenerContext;

    listenerMethod(
      event,
      async (...args: unknown[]) => {
        const request = this.getRequestFromEventPayload(args);
        const contextId = ContextIdFactory.getByRequest<
          EventPayloadHost<unknown>
        >({ payload: request });

        this.moduleRef.registerRequestByContextId(request, contextId);

        const contextInstance = await this.injector.loadPerContext(
          eventListenerInstance,
          moduleRef,
          moduleRef.providers,
          contextId,
        );
        return this.wrapFunctionInTryCatchBlocks(
          contextInstance,
          listenerMethodKey,
          args,
          options,
        );
      },
      options,
    );
  }

  private getRequestFromEventPayload(eventPayload: unknown[]): unknown {
    /*
      **Required explanation for the ternary below**

      We need the conditional below because an event can be emitted with a variable amount of arguments.
      For instance, we can do `this.eventEmitter.emit('event', 'payload1', 'payload2', ..., 'payloadN');`

      All payload arguments are internally stored as an array. So, imagine we emitted an event as follows:

      `this.eventEmitter.emit('event', 'payload');

      if we registered the original `eventPayload`, when we try to inject it in a listener, it'll be retrieved as [`payload`].
      However, whoever is using this library would certainly expect the event payload to be a single string 'payload', not an array,
      since this is what we emitted above.
    */
    return eventPayload.length > 1 ? eventPayload : eventPayload[0];
  }

  private async wrapFunctionInTryCatchBlocks(
    instance: Record<string, (...args: unknown[]) => unknown>,
    methodKey: string,
    args: unknown[],
    options?: OnEventOptions,
  ) {
    try {
      // Obtener los metadatos de los parámetros del método
      const paramMetadata = this.getParamMetadata(instance, methodKey);

      // Si no hay metadatos de parámetros, llamar directamente al método
      if (!paramMetadata) {
        return await instance[methodKey].call(instance, ...args);
      }

      // Si hay metadatos, resolver los parámetros basados en los decoradores
      const resolvedParams = this.resolveParams(paramMetadata, args);
      return await instance[methodKey].call(instance, ...resolvedParams);
    } catch (e) {
      if (options?.suppressErrors ?? true) {
        const error = e as Error;
        this.logger.error(error.message, error.stack);
      } else {
        throw e;
      }
    }
  }

  /**
   * Obtiene los metadatos de los parámetros de un método
   */
  private getParamMetadata(instance: Record<string, any>, methodKey: string) {
    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      instance.constructor,
      methodKey,
    );
    return metadata;
  }

  /**
   * Resuelve los parámetros del método a partir de los metadatos y los argumentos del evento
   */
  private resolveParams(metadata: Record<string, any>, args: unknown[]) {
    // Si no hay metadatos, devolver los args sin cambios
    if (!metadata) {
      return args;
    }

    // Obtener el número máximo de parámetros
    const paramIndexes = Object.keys(metadata)
      .map((key) => parseInt(key.split(':')[1], 10))
      .filter((index) => !isNaN(index));

    const maxParamIndex = Math.max(...paramIndexes, -1);
    const resolvedParams = new Array(maxParamIndex + 1);

    // Inicializar con undefined
    for (let i = 0; i < resolvedParams.length; i++) {
      resolvedParams[i] = undefined;
    }

    // Recorrer los metadatos para resolver los parámetros
    for (const key in metadata) {
      const { index, data, pipes } = metadata[key];
      const [type] = key.split(':');

      // Mapear los tipos de parámetros a las posiciones en args
      if (type === EVENT_PARAM_TYPE.BODY) {
        resolvedParams[index] = args.length > 0 ? args[0] : {};
      } else if (type === EVENT_PARAM_TYPE.CONTEXT) {
        resolvedParams[index] = args.length > 1 ? args[1] : null;
      }
    }

    // Para cualquier parámetro que no esté decorado, usar los argumentos originales
    for (let i = 0; i < resolvedParams.length; i++) {
      if (resolvedParams[i] === undefined && i < args.length) {
        resolvedParams[i] = args[i];
      }
    }

    return resolvedParams;
  }
}
