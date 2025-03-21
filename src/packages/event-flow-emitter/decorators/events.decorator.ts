import { SetMetadata } from '@nestjs/common';

import { listenTypes } from '#/listen-types.d.ts';

import { OnEvent } from './on-event.decorator.ts';

export const EMITS_EVENTS_KEY = 'emits_events';

/**
 * Decorador para documentar los eventos que un método de un controlador puede emitir.
 * @param events Array de strings representando los nombres de los eventos.
 */
export const EmitsEvents = (events: string[]): MethodDecorator =>
  SetMetadata(EMITS_EVENTS_KEY, events);

export const EVENTS_METADATA_KEY = 'events_metadata';

export interface EventsOptions {
  emit?: string[];
  listen?: listenTypes[];
}

/**
 * Decorador personalizado para documentar y registrar eventos en controladores o servicios.
 * Permite definir eventos que se emiten y se escuchan, y se integra con @nestjs/event-emitter para
 * registrar automáticamente los listeners. La metadata generada puede ser utilizada para
 * generar documentación automática en un formato similar a OpenAPI, pero adaptado a eventos.
 *
 * Ejemplo de uso:
 *
 * @Events({
 *   emit: 'new user',
 *   listen: [
 *     'send welcome email',
 *     'send notification sponsors',
 *     'new message to slack dev channel'
 *   ]
 * })
 */
export const Events = (options: EventsOptions = {}): MethodDecorator => {
  const { emit, listen } = options;

  const metadataValue = { emit, listen };

  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    // Guarda la metadata para la generación de documentación
    Reflect.defineMetadata(
      EVENTS_METADATA_KEY,
      metadataValue,
      descriptor.value,
    );

    if (metadataValue?.listen?.length == null) return;

    // Si se definen eventos a escuchar, utiliza el decorador OnEvent de @nestjs/event-emitter
    if (metadataValue.listen.length > 0) {
      metadataValue.listen.forEach((eventName) => {
        OnEvent(eventName, { async: true, promisify: true })(
          target,
          propertyKey,
          descriptor,
        );
      });
    }
  };
};
