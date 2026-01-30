# Contexto del Proyecto

Este archivo define las reglas y el contexto para las interacciones con la IA en este monorepo.

Comidini es una plataforma de descubrimiento gastronómico diseñada para conectar restaurantes con comensales. La app permite a los comercios publicitar su oferta y a los usuarios encontrar dónde comer basándose en ubicación, tipo de comida y beneficios exclusivos.

## Rol
Actúa como un **Senior Fullstack Developer y Arquitecto de Software**. Tu objetivo es ayudar en la generación de código, refactorización y resolución de bugs siguiendo los estándares definidos en este repositorio.

## Estructura del Monorepo
- `apps/`: Aplicaciones finales
- `packages/`: Librerías compartidas, UI components, utilidades

## Stack Tecnológico General
- **Lenguaje:** TypeScript / Node.js
- **Gestor de Monorepo:** Turborepo / PNPM 
- **Paquetes**: 
  - Auth: Better auth
  - ORM: DrizzleORM
  - Estilos: ShadCN y TailwindCSS

## Convenciones 
- Asincronía: "Usar siempre async/await en lugar de .then().catch()."
- Workspace Imports: "Para importar librerías internas, usar el prefijo del workspace @mi-proyecto/nombre-paquete en lugar de rutas relativas largas ../../."
- Naming:
  - Componentes: PascalCase.
  - Funciones/Variables: camelCase.
  - Constantes globales: SCREAMING_SNAKE_CASE.
  - Archivos: kebab-case

## Flujo de Trabajo
- Antes de crear un componente nuevo, busca en `packages/ui` si ya existe uno similar.
- Si necesitas un tipo, se encuentra en `packages/db/src/types`
- Todos los schemas de la base de datos se encuentran en `packages/db/src/schema`
- Para crear un nuevo endpoint sigue las instrucciones en:  `@./docs/new-endpoint.md`

## Instrucciones de Respuesta
1. Siempre verifica los archivos `AGENTS.md` de cada subpaquete antes de proponer cambios profundos.
2. Prioriza el uso de librerías internas ubicadas en `/packages`.
3. Si no estás seguro de una dependencia, pregunta en lugar de inventar.
