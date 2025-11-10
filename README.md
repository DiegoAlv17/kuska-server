# Kuska Server

## Instalación

1. Clonar el repositorio e instalar dependencias:

```bash
npm install
```

2. Crear archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL=""

# JWT Configuration
JWT_SECRET=""
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET=""
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="development"
PORT="3000"

# CORS Configuration
CORS_ORIGIN="*"
```

## Configurar Prisma y Base de Datos

### 1. Generar cliente de Prisma

```bash
npx prisma generate
```

### 2. Ejecutar migraciones

```bash
npx prisma migrate dev
```

## Endpoints de API

### Autenticación (`/api/auth`)

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Obtener usuario actual (requiere autenticación)
- `POST /api/auth/logout` - Cerrar sesión (requiere autenticación)

### Proyectos (`/api/projects`)

Rutas protegidas con autenticación.

### Tareas (`/api/tasks`)

Rutas protegidas con autenticación.

### Equipos (`/api/teams`)

Rutas protegidas con autenticación.

## Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación
│   ├── application/         # Casos de uso y DTOs
│   ├── domain/              # Entidades, value objects y excepciones
│   └── infrastructure/      # Controladores, repositorios y servicios
├── projects/                # Módulo de proyectos
├── task/                    # Módulo de tareas
├── tems/                    # Módulo de equipos
└── shared/                  # Código compartido
    ├── infrastructure/      # Middlewares y utilidades
    └── types/               # Definiciones de tipos TypeScript
```

## Comandos útiles de Prisma

```bash
# Crear una nueva migración
npx prisma migrate dev --name nombre_de_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear base de datos (desarrollo)
npx prisma migrate reset

# Ver el estado de las migraciones
npx prisma migrate status

# Formatear schema.prisma
npx prisma format
```

## Tecnologías

- **Express.js** - Framework web
- **TypeScript** - Lenguaje de programación
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Zod** - Validación de datos
- **Bcrypt** - Hash de contraseñas