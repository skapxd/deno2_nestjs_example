/**
 * Archivo generado automáticamente. No modificar.
 */

export type listenTypes =
  | '**'
  | ""
  | (string & NonNullable<unknown>);

declare module '@nestjs/event-emitter' {
  // Sobrescribimos la interfaz de EventEmitter2 para modificar el tipo del primer parámetro de emit
  export interface EventEmitter2 {
    emit<T = any>(event: listenTypes, value?: T): boolean;
    emitAsync<T = any>(event: listenTypes, value?: T): Promise<any[]>;
  }
}
