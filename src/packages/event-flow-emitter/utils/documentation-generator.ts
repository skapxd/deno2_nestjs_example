import { EVENTS_METADATA_KEY } from '../decorators/events.decorator.ts';

/**
 * Genera la documentación de eventos en un formato similar a OpenAPI,
 * basado en los metadatos extraídos de los controladores registrados en la aplicación.
 *
 * Se generan dos secciones:
 * - eventMappings: Mapea cada método (por su nombre completo, ej. ControllerName.methodName) a los eventos que emite y escucha.
 * - events: Agrupa los eventos por su nombre (utilizando los valores de "listen") y asocia una descripción y los eventos emitidos.
 *
 * @param controllers Array de controladores (clases) extraídas de la aplicación NestJS.
 * @returns Objeto con la documentación de eventos.
 */
export function generateEventsDocumentation(controllers: any[]): any {
  const eventsDocumentation: Record<
    string,
    { description: string; emitters: string[] }
  > = {};
  const eventMappings: Record<string, { emit: string[]; listen: string[] }> =
    {};

  controllers.forEach((controller) => {
    const controllerName = controller.name;
    const prototype = controller.prototype;

    // Recorre todos los métodos del controlador
    Object.getOwnPropertyNames(prototype).forEach((methodName) => {
      if (methodName === 'constructor') return;
      const method = prototype[methodName];
      const metadata = Reflect.getMetadata(EVENTS_METADATA_KEY, method);
      if (metadata) {
        const { listen, emit } = metadata;
        // Define la clave del mapeo usando el nombre del controlador y el método
        const mappingKey = `${controllerName}.${methodName}`;
        let emitArray: string[] = [];

        if (Array.isArray(emit)) {
          emitArray = emit;
        } else if (emit) {
          emitArray = [emit];
        } else {
          emitArray = [];
        }

        let listenArray: string[] = [];
        if (Array.isArray(listen)) {
          listenArray = listen;
        } else if (listen) {
          listenArray = [listen];
        } else {
          listenArray = [];
        }

        eventMappings[mappingKey] = {
          emit: emitArray,
          listen: listenArray,
        };

        // Procesa la metadata para la sección "events", documentando solo eventos emitidos
        if (emitArray && emitArray.length) {
          // Para cada evento emitido, se asigna la descripción indicando que fue emitido por el método correspondiente
          emitArray.forEach((emitEvent: string) => {
            if (!eventsDocumentation[emitEvent]) {
              eventsDocumentation[emitEvent] = {
                description: `Event "${emitEvent}" emitted by ${mappingKey}`,
                emitters: [mappingKey],
              };
            } else {
              // Actualiza la descripción para reflejar que múltiples métodos pueden emitir el mismo evento
              eventsDocumentation[emitEvent].description += `, ${mappingKey}`;
              eventsDocumentation[emitEvent].emitters.push(mappingKey);
            }
          });
        }
      }
    });
  });

  // Elimina duplicados en los eventos emitidos
  Object.keys(eventsDocumentation).forEach((event) => {
    eventsDocumentation[event].emitters = Array.from(
      new Set(eventsDocumentation[event].emitters),
    );
  });

  // Construye la estructura final en un formato similar a OpenAPI con eventMappings y events
  const documentation = {
    openapi: '3.0.0',
    info: {
      title: 'Events Documentation',
      version: '1.0.0',
    },
    eventMappings,
    events: eventsDocumentation,
  };

  return documentation;
}
