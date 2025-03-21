export function generateEventsHtml(documentation: any): string {
  const mappings = documentation.eventMappings;
  let diagram = 'graph LR;\n';

  // Función auxiliar para determinar si un evento emitido coincide con un patrón de escucha,
  // soportando comodines basados en el delimitador '.'
  function matchesEvent(
    emittedEvent: string,
    listenerPattern: string,
  ): boolean {
    if (listenerPattern.includes('*')) {
      const prefix = listenerPattern.split('*')[0];
      return emittedEvent.startsWith(prefix);
    }
    return emittedEvent === listenerPattern;
  }

  // Recorre cada método emisor y crea conexiones hacia los métodos que escuchan el mismo evento
  Object.keys(mappings).forEach((emitterMethod) => {
    const emitterMapping = mappings[emitterMethod];
    if (emitterMapping.emit && emitterMapping.emit.length > 0) {
      emitterMapping.emit.forEach((event: string) => {
        // Busca en todos los mapeos los métodos que escuchan el mismo evento (incluyendo patrones wildcard)
        Object.keys(mappings).forEach((listenerMethod) => {
          const listenerMapping = mappings[listenerMethod];
          if (
            listenerMapping.listen &&
            listenerMapping.listen.some((pattern: string) =>
              matchesEvent(event, pattern),
            )
          ) {
            // Agrega la conexión con etiqueta del evento
            diagram += `${emitterMethod} -- ${event}-->${listenerMethod};\n`;
          }
        });
      });
    }
  });

  diagram = diagram.trim();

  // Retorna un HTML que incluye Mermaid y el diagrama generado
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${documentation.info.title}</title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
  </script>
  <script nomodule src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; }
    .mermaid { margin: 20px; }
  </style>
</head>
<body>
  <div class="mermaid">
${diagram}
  </div>
</body>
</html>
`;
}
