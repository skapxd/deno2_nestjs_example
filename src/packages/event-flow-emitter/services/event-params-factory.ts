import { Injectable } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common/interfaces';

import { ROUTE_ARGS_METADATA } from '../decorators/event-param.decorator.ts';

/**
 * Factoría encargada de manejar los decoradores de parámetros para eventos
 */
@Injectable()
export class EventParamsFactory {
  /**
   * Extrae los parámetros decorados con los decoradores de eventos de una lista de argumentos
   */
  exchangeKeyForValue(
    key: string | symbol,
    data: ArgumentMetadata,
    args: any[],
  ): any {
    const parametersMap = {
      body: args.length > 0 ? args[0] : {},
      context: args.length > 1 ? args[1] : null,
    };

    return parametersMap[String(key)] || null;
  }

  /**
   * Extrae los metadatos de los parámetros de una función
   */
  extractParamMetadata(target: object, key: string | symbol) {
    const args = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      target.constructor,
      key,
    );
    return args;
  }
}
