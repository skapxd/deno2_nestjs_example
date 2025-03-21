/**
 * Genera el contenido del archivo listen-types.d.ts basado en la documentación generada.
 *
 * La función itera sobre la documentación de eventos y, para cada listen (clave del objeto events),
 * agrega los emits asociados a un conjunto global. Luego, genera un type alias con la unión de todos los emits.
 *
 * @param documentation Documentación generada por generateEventsDocumentation.
 * @returns Contenido para el archivo listen-types.d.ts.
 */
export function generateListenTypesDefinition(documentation: any): string {
  const events = documentation.events;
  const allEmits = new Set<string>();

  Object.keys(events).forEach((event) => {
    // Agrega el evento completo
    allEmits.add(event);

    // Soporte para wildcard: si el evento contiene el delimitador '.'
    // se generan patrones wildcard para cada nivel jerárquico.
    if (event.includes('.')) {
      const segments = event.split('.');
      if (segments.length > 1) {
        // Por cada nivel excepto el último, genera un wildcard
        for (let i = 1; i < segments.length; i++) {
          const wildcardEvent = segments.slice(0, i).join('.') + '.*';
          allEmits.add(wildcardEvent);
        }
      }
    }
  });

  const unionType = Array.from(allEmits).map((e) => `'${e}'`);

  const content = `/**
 * Archivo generado automáticamente. No modificar.
 */

export type listenTypes =
  | '**'
  | ${unionType.join('\n  | ') || '""'}
  | (string & NonNullable<unknown>);

declare module '@nestjs/event-emitter' {
  // Sobrescribimos la interfaz de EventEmitter2 para modificar el tipo del primer parámetro de emit
  export interface EventEmitter2 {
    emit<T = any>(event: listenTypes, value?: T): boolean;
    emitAsync<T = any>(event: listenTypes, value?: T): Promise<any[]>;
  }
}
`;

  return content;
}
