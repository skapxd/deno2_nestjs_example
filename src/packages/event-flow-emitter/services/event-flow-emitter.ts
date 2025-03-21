import { randomUUID } from "node:crypto";

import * as eventemitter2 from "eventemitter2";
import type { ConstructorOptions } from "eventemitter2";

import { listenTypes } from "#/listen-types.d.ts";

// Definición de tipos
export interface EventData {
  [key: string]: any;
}

export interface EventRecord {
  id: string;
  eventName: string;
  eventData: EventData;
  timestamp: number;
  contextId: string;
}

export interface EventContext {
  eventChain: EventRecord[];
  rootEvent: string;
  currentEvent: EventRecord;
  contextId: string;
}

export class EventFlowEmitter extends eventemitter2.default.EventEmitter2 {
  private currentEventContext: EventContext | null = null;
  private isProcessingEvent = false;

  constructor(options?: ConstructorOptions) {
    super(options);
  }

  // Método para obtener o crear un contexto
  private getOrCreateContext(
    eventName: string,
    eventData: EventData,
    parentContext?: EventContext | null
  ): EventContext {
    const contextId = parentContext ? parentContext.contextId : randomUUID();
    const newEventRecord: EventRecord = {
      id: randomUUID(),
      eventName,
      eventData,
      timestamp: Date.now(),
      contextId,
    };

    if (parentContext) {
      return {
        ...parentContext,
        eventChain: [...parentContext.eventChain, newEventRecord],
        currentEvent: newEventRecord,
        contextId,
      };
    } else {
      return {
        eventChain: [newEventRecord],
        rootEvent: eventName,
        currentEvent: newEventRecord,
        contextId,
      };
    }
  }

  // Sobrescribir el método emit original
  public override emit(event: listenTypes, ...args: any[]): boolean {
    const eventName = Array.isArray(event) ? event.join(".") : event;
    const eventData = args.length > 0 ? args[0] : {};

    // Verificar si el último argumento es un contexto
    const lastArg = args.length > 0 ? args[args.length - 1] : null;
    const parentContext =
      lastArg && lastArg.eventChain ? (lastArg as EventContext) : null;

    // Crear o actualizar el contexto
    const context = this.getOrCreateContext(
      eventName,
      eventData,
      parentContext
    );
    this.currentEventContext = context;

    // Marcar que estamos procesando un evento para manejar eventos anidados
    const prevProcessingState = this.isProcessingEvent;
    this.isProcessingEvent = true;

    // Si no hay un contexto en los argumentos, añadirlo
    if (!parentContext) {
      args.push(context);
    } else {
      // Reemplazar el contexto antiguo con el nuevo
      args[args.length - 1] = context;
    }

    // Llamar al método emit original
    const result = super.emit(event, ...args);

    // Restaurar el estado de procesamiento anterior
    this.isProcessingEvent = prevProcessingState;
    if (!prevProcessingState) {
      this.currentEventContext = null;
    }

    return result;
  }

  // Sobrescribir el método emitAsync
  public override async emitAsync(event: listenTypes, ...args: any[]): Promise<any[]> {
    const eventName = Array.isArray(event) ? event.join(".") : event;
    const eventData = args.length > 0 ? args[0] : {};

    // Verificar si el último argumento es un contexto
    const lastArg = args.length > 0 ? args[args.length - 1] : null;
    const parentContext =
      lastArg && lastArg.eventChain ? (lastArg as EventContext) : null;

    // Crear o actualizar el contexto
    const context = this.getOrCreateContext(
      eventName,
      eventData,
      parentContext
    );
    this.currentEventContext = context;

    // Marcar que estamos procesando un evento para manejar eventos anidados
    const prevProcessingState = this.isProcessingEvent;
    this.isProcessingEvent = true;

    // Si no hay un contexto en los argumentos, añadirlo
    if (!parentContext) {
      args.push(context);
    } else {
      // Reemplazar el contexto antiguo con el nuevo
      args[args.length - 1] = context;
    }

    // Llamar al método emitAsync original
    try {
      const result = await super.emitAsync(event, ...args);
      return result;
    } finally {
      // Restaurar el estado de procesamiento anterior
      this.isProcessingEvent = prevProcessingState;
      if (!prevProcessingState) {
        this.currentEventContext = null;
      }
    }
  }

  // Método para obtener el contexto actual
  public getCurrentContext(): EventContext | null {
    return this.currentEventContext;
  }
}
