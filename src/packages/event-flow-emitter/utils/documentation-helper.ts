import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { INestApplication, Type } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';

import { generateEventsDocumentation } from './documentation-generator.ts';
import { generateEventsHtml } from './generate-events-flow-html.ts';
import { generateListenTypesDefinition } from './generate-listen-types-definition.ts';
import process from "node:process";

// Extiende la interfaz INestApplication para incluir propiedades internas
interface NestApplicationInternal extends INestApplication {
  [key: string]: any; // Permite el acceso a propiedades internas como 'container'
}

/**
 * Extrae todos los controladores registrados en la aplicación y genera la documentación de eventos.
 * @param app Instancia de la aplicación NestJS
 * @param options Opciones para configurar la generación de documentación
 * @returns Promise que se resuelve cuando se ha generado toda la documentación
 */
export async function extractEventsDocumentation(
  app: INestApplication,
  options: {
    outputDir?: string;
    typeFile?: string;
    docFile?: string;
    htmlFile?: string;
    generateTypeFileInPackage?: boolean;
  } = {},
): Promise<void> {
  const {
    outputDir = '.',
    typeFile = 'listen-types.d.ts',
    docFile = 'public/event-doc.json',
    htmlFile = 'public/events-flow.html',
    generateTypeFileInPackage = true,
  } = options;

  // Accede al contenedor interno de NestJS
  const appInternal = app as NestApplicationInternal;
  const modulesContainer: ModulesContainer =
    appInternal['container'].getModules();
  const controllers: (Function | Type<object> | null)[] = [];
  modulesContainer.forEach((module) => {
    module.controllers.forEach((controller) => {
      controllers.push(controller.metatype);
    });
  });

  const doc = generateEventsDocumentation(controllers);

  const eventFlowHtml = generateEventsHtml(doc);
  const listenTypes = generateListenTypesDefinition(doc);

  // Determinar la ruta para el archivo de tipos
  const typeFilePath = join(process.cwd(), typeFile);
  // if (generateTypeFileInPackage) {
  //   // Si se debe generar en el paquete, usamos dirname para obtener el directorio actual
  //   // y navegamos hacia la raíz del paquete
  //   const packageRoot = resolve(__dirname, '../../../');
  //   typeFilePath = resolve(packageRoot, typeFile);
  // } else {
  //   // Si no, lo generamos en el directorio especificado por el usuario
  //   typeFilePath = resolve(outputDir, typeFile);
  // }

  const docFilePath = resolve(outputDir, docFile);
  const htmlFilePath = resolve(outputDir, htmlFile);

  await writeFile(typeFilePath, listenTypes);
  await writeFile(docFilePath, JSON.stringify(doc, null, 2));
  await writeFile(htmlFilePath, eventFlowHtml);
}
