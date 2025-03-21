import { PipeTransform, Type } from '@nestjs/common';

// Constante usada por NestJS para almacenar los metadatos de los parámetros
export const ROUTE_ARGS_METADATA = '__routeArguments__';

/**
 * Claves para los tipos de parámetros
 */
export enum EVENT_PARAM_TYPE {
  BODY = 'body',
  CONTEXT = 'context',
}

/**
 * Crea un decorador de parámetro para los eventos
 */
export function createEventParamDecorator(paramtype: EVENT_PARAM_TYPE) {
  return (
      data?: any,
      ...pipes: (Type<PipeTransform> | PipeTransform)[]
    ): ParameterDecorator =>
    (target: any, key?: string | symbol, index?: number) => {
      if (key === undefined || index === undefined) return;
      const args =
        Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) || {};

      // Es necesario usar un índice de nombre largo para evitar colisiones en el nombre de la propiedad
      // el formato que usa NestJS es "paramtype:index"
      const paramIdx = `${paramtype}:${index}`;
      args[paramIdx] = {
        index,
        data,
        pipes,
      };

      Reflect.defineMetadata(
        ROUTE_ARGS_METADATA,
        args,
        target.constructor,
        key,
      );
    };
}

/**
 * Decorador de parámetro para extraer los datos (body) del evento
 * @example
 * @Events({ listen: ['send.event'] })
 * async handleEvent(@EventBody() data: MyEventData) {
 *   // Acceso directo a los datos del evento
 * }
 */
export const EventBody = createEventParamDecorator(EVENT_PARAM_TYPE.BODY);

/**
 * Decorador de parámetro para extraer el contexto del evento
 * @example
 * @Events({ listen: ['send.event'] })
 * async handleEvent(@EventCtx() context: EventContext) {
 *   // Acceso directo al contexto del evento
 * }
 */
export const EventCtx = createEventParamDecorator(EVENT_PARAM_TYPE.CONTEXT);
