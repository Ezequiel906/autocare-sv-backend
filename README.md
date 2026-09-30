# AutoCare SV — Backend

API REST para **AutoCare SV**, una aplicación web para la gestión de servicios automotrices, citas, vehículos, usuarios y roles.

Este backend fue desarrollado con **NestJS**, utilizando **Prisma ORM** para la comunicación con una base de datos MySQL y autenticación basada en JWT.

## Demo

**Frontend:** https://autocare-sv.vercel.app

**Repositorio del frontend:**

https://github.com/Ezequiel906/autocare-sv

El backend se encuentra desplegado de forma independiente y es consumido por el frontend mediante una API REST.

> El servicio puede entrar en hibernación después de un período de inactividad. Por ello, la primera petición después de un tiempo sin uso puede tardar unos segundos mientras el servicio vuelve a estar disponible.

### Cuenta de demostración — Administrador

```text
Email: autocareSV@gmail.com
Contraseña: AutoCare2026
```

> Estas credenciales corresponden únicamente a la cuenta de demostración del proyecto.

## Funcionalidades

### Autenticación y usuarios

* Registro de usuarios.
* Inicio de sesión.
* Autenticación mediante JWT.
* Contraseñas almacenadas utilizando hash con bcrypt.
* Control de acceso basado en roles.
* Roles disponibles:

  * `CUSTOMER`
  * `ADMIN`

### Vehículos

* Registro de vehículos asociados a usuarios.
* Consulta de vehículos.
* Gestión de información de los vehículos.

### Citas

* Creación de citas.
* Consulta de citas.
* Gestión de información relacionada con las citas.
* Asociación de citas con clientes, vehículos y servicios.

### Servicios

El sistema incluye servicios relacionados con el mantenimiento automotriz, entre ellos:

* Cambio de aceite.
* Filtros.
* Control de fluidos.
* Baterías.
* Inspección rápida.
* Mantenimiento básico.

### Historial de servicios

* Registro del historial de servicios realizados.
* Consulta del historial asociado al cliente y sus vehículos.

## Tecnologías

* NestJS
* TypeScript
* Prisma ORM
* MySQL
* JWT
* Passport
* bcrypt
* class-validator
* class-transformer
* Vitest
* Jest
* Oxlint

## Arquitectura

El proyecto utiliza la arquitectura modular de NestJS para separar las diferentes responsabilidades de la aplicación.

Entre sus principales áreas se encuentran:

* Autenticación.
* Usuarios.
* Vehículos.
* Citas.
* Servicios.
* Historial de servicios.
* Administración.

La aplicación utiliza **Prisma** como ORM para interactuar con la base de datos y manejar el modelo de datos.

La autenticación utiliza JWT y el acceso a determinados recursos está protegido mediante roles.

## Base de datos

El proyecto utiliza **MySQL** como sistema de base de datos.

Prisma se utiliza para:

* Definir el esquema de la base de datos.
* Generar el cliente de Prisma.
* Ejecutar migraciones.
* Consultar y modificar información.
* Mantener sincronizado el modelo de datos con la aplicación.

El esquema principal se encuentra en:

```text
prisma/schema.prisma
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto.

Ejemplo:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
JWT_SECRET=replace-with-a-secure-secret
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=
ADMIN_PASSWORD=
PORT=3000
```

### Variables

| Variable         | Descripción                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`   | URL de conexión a la base de datos MySQL.                                    |
| `JWT_SECRET`     | Clave utilizada para firmar los tokens JWT.                                  |
| `FRONTEND_URL`   | URL permitida para las solicitudes del frontend.                             |
| `ADMIN_EMAIL`    | Correo utilizado por el seed para crear o promover la cuenta administrativa. |
| `ADMIN_PASSWORD` | Contraseña utilizada para crear la cuenta administrativa mediante el seed.   |
| `PORT`           | Puerto utilizado por la aplicación.                                          |

Las variables de entorno reales no deben almacenarse en el repositorio.

## Instalación

### Requisitos

* Node.js
* npm
* MySQL
* Una base de datos configurada para el proyecto.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Ezequiel906/autocare-sv-backend.git
cd autocare-sv-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear el archivo `.env` y configurar las variables necesarias.

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
JWT_SECRET=replace-with-a-secure-secret
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=
ADMIN_PASSWORD=
PORT=3000
```

### 4. Generar el cliente de Prisma

```bash
npx prisma generate
```

### 5. Ejecutar las migraciones

```bash
npx prisma migrate deploy
```

Para desarrollo, las migraciones también pueden ejecutarse mediante:

```bash
npx prisma migrate dev
```

### 6. Ejecutar el seed

```bash
npm run seed
```

El seed se encarga de mantener disponibles los servicios iniciales del sistema y configurar la cuenta administrativa utilizando `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

Si el usuario administrativo ya existe, el seed evita crear duplicados.

## Ejecución

### Desarrollo

```bash
npm run start:dev
```

El servidor estará disponible normalmente en:

```text
http://localhost:3000
```

### Producción

Primero generar el build:

```bash
npm run build
```

Después ejecutar:

```bash
npm run start:prod
```

## Scripts disponibles

### Desarrollo

```bash
npm run start:dev
```

Inicia el servidor en modo desarrollo.

### Build

```bash
npm run build
```

Genera la versión compilada de la aplicación.

### Producción

```bash
npm run start:prod
```

Ejecuta la aplicación compilada para producción.

### Seed

```bash
npm run seed
```

Ejecuta el seed inicial de la base de datos.

### Lint

```bash
npm run lint
```

Ejecuta las comprobaciones de linting del proyecto.

### Tests

```bash
npm run test
```

Ejecuta las pruebas unitarias.

```bash
npm run test:e2e
```

Ejecuta las pruebas end-to-end.

```bash
npm run test:cov
```

Genera el reporte de cobertura de pruebas.

## API

El backend proporciona endpoints para las principales operaciones de la aplicación.

Entre las áreas principales de la API se encuentran:

* Autenticación.
* Usuarios.
* Vehículos.
* Citas.
* Servicios.
* Historial de servicios.

El frontend consume estos recursos mediante solicitudes HTTP utilizando Axios.

## Seguridad

El backend implementa diferentes mecanismos de seguridad:

* Autenticación mediante JWT.
* Hash de contraseñas con bcrypt.
* Validación de datos mediante `class-validator`.
* Protección de rutas.
* Control de acceso mediante roles.
* Variables sensibles mediante variables de entorno.

Las credenciales de producción no se incluyen en el repositorio.

## Deployment

El backend está desplegado de forma independiente del frontend.

La aplicación utiliza variables de entorno proporcionadas por el servicio de hosting para configurar:

* Conexión a la base de datos.
* JWT.
* URL permitida del frontend.
* Cuenta administrativa.
* Puerto de ejecución.

El frontend se conecta al backend utilizando la URL configurada en `VITE_API_URL`.

## Desarrollo con asistencia de IA

Durante el desarrollo del proyecto se utilizó **Codex** como herramienta de asistencia para la implementación, revisión y depuración del código.

El desarrollo se realizó de forma incremental, validando los cambios mediante compilación, linting, pruebas manuales y pruebas de integración entre frontend y backend.

## Licencia

Este proyecto fue desarrollado como proyecto personal de portafolio.
