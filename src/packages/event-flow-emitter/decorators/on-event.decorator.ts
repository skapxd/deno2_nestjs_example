import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util.js';

import { OnEventOptions } from '../interfaces/on-event-options.interface.ts';
import { EVENT_LISTENER_METADATA } from '../utils/constants.ts';

/**
 * `@OnEvent` decorator metadata
 */
export interface OnEventMetadata {
  /**
   * Event (name or pattern) to subscribe to.
   */
  event: string | symbol | Array<string | symbol>;
  /**
   * Subscription options.
   */
  options?: OnEventOptions;
}

/**
 * `@OnEvent` decorator event type
 */
export type OnEventType = string | symbol | Array<string | symbol>;

/**
 * Event listener decorator.
 * Subscribes to events based on the specified name(s).
 *
 * @param event event to subscribe to
 */
export const OnEvent = (
  event: OnEventType,
  options?: OnEventOptions,
): MethodDecorator => {
  const decoratorFactory = (
    target: object,
    key?: any,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    extendArrayMetadata(
      EVENT_LISTENER_METADATA,
      [{ event, options } as OnEventMetadata],
      descriptor!.value as (...args: any[]) => any,
    );
    return descriptor;
  };
  decoratorFactory.KEY = EVENT_LISTENER_METADATA;
  return decoratorFactory;
};
