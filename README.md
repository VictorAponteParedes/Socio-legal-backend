# SocioLegal Backend

Backend de la aplicación SocioLegal construido con NestJS, PostgreSQL y TypeORM.

## 🏗️ Arquitectura

### Estructura de Carpetas

```
src/
├── auth/                    # Módulo de autenticación
│   ├── dto/                 # Data Transfer Objects
│   ├── strategies/          # Estrategias de autenticación (JWT)
│   ├── auth.controller.ts   # Controlador de endpoints
│   ├── auth.service.ts      # Lógica de negocio
│   └── auth.module.ts       # Configuración del módulo
│
├── users/                   # Módulo de usuarios
│   ├── entities/            # Entidades de base de datos
│   │   ├── user.entity.ts   # Entidad base para usuarios
│   │   ├── client.entity.ts # Entidad para clientes
│   │   └── lawyer.entity.ts # Entidad para abogados
│   ├── dto/                 # DTOs de usuarios
│   └── services/            # Servicios de usuarios
│
├── common/                  # Código compartido
│   ├── constants/           # Constantes y enums
│   ├── decorators/          # Decoradores personalizados
│   ├── guards/              # Guards de autorización
│   ├── validators/          # Validadores personalizados
│   ├── helpers/             # Funciones helper
│   └── filters/             # Filtros de excepciones
│
└── config/                  # Configuración de la aplicación
    └── env.config.ts        # Configuración de variables de entorno
```

### Modelo de Datos

#### Herencia de Entidades (Single Table Inheritance)

Usamos **herencia de tabla única (STI)** para los usuarios:

- **User** (Base): Campos comunes para todos los usuarios
  - `id`, `name`, `lastname`, `email`, `password`, `role`, `status`, `phone`, `profilePicture`

- **Client** (Hereda de User): Campos específicos para clientes
  - `address`, `city`, `country`, `preferences`

- **Lawyer** (Hereda de User): Campos específicos para abogados
  - `license` (matrícula profesional) ⚠️ Requerido
  - `bio`, `specializations`, `yearsOfExperience`
  - `rating`, `totalReviews`, `languages`
  - `isAvailable`, `officeAddress`, `city`, `country`

#### Enums

**UserRole**:
- `client` - Cliente que busca servicios legales
- `lawyer` - Abogado que ofrece servicios

**UserStatus**:
- `active` - Usuario activo (por defecto)
- `inactive` - Usuario inactivo
- `suspended` - Usuario suspendido
- `pending` - Usuario pendiente de aprobación

## 🔌 API Endpoints

### Autenticación

#### 1. Registro de Usuario

```http
POST /api/auth/register
Content-Type: application/json

// Para Cliente
{
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "client"
}

// Para Abogado
{
  "name": "María",
  "lastname": "González",
  "email": "maria@example.com",
  "password": "password123",
  "role": "lawyer",
  "license": "MP-12345"  // ⚠️ Requerido para lawyers
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid",
    "name": "Juan",
    "lastname": "Pérez",
    "email": "juan@example.com",
    "role": "client",
    "status": "active",
    "createdAt": "2025-12-26T...",
    "updatedAt": "2025-12-26T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores Posibles:**
- `400 Bad Request`: Validación fallida (campos faltantes o inválidos)
- `409 Conflict`: Email o matrícula ya registrados

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "uuid",
    "email": "juan@example.com",
    "name": "Juan",
    "lastname": "Pérez",
    "role": "client",
    "status": "active"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores Posibles:**
- `401 Unauthorized`: Credenciales incorrectas

## 🔒 Autenticación y Autorización

### JWT Token

Todos los endpoints protegidos requieren un token JWT en el header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Uso de Guards

```typescript
// Proteger un endpoint con autenticación
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user) {
  return user;
}

// Proteger un endpoint solo para abogados
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LAWYER)
@Get('lawyer-only')
lawyerOnlyEndpoint() {
  return 'Solo abogados pueden ver esto';
}
```

### Decoradores Personalizados

- `@CurrentUser()`: Obtiene el usuario autenticado actual
- `@Roles(...roles)`: Especifica qué roles pueden acceder al endpoint

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### Comandos Disponibles

```bash
# Desarrollo (con hot-reload)
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm test

# Linting
npm run lint
```

## 🛠️ Configuración

### Variables de Entorno (.env)

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=victoraponte
DB_PASSWORD=Admin123.
DB_DATABASE=socio_legal
DB_SYNCHRONIZE=true  # ⚠️ false en producción
DB_LOGGING=true

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006,http://localhost:8081
```

## 📦 Dependencias Principales

- **@nestjs/core**: Framework base
- **@nestjs/typeorm** + **typeorm**: ORM para PostgreSQL
- **@nestjs/jwt** + **passport-jwt**: Autenticación JWT
- **class-validator** + **class-transformer**: Validación de DTOs
- **bcrypt**: Hash de contraseñas
- **pg**: Driver de PostgreSQL

## 🔐 Seguridad

### Hash de Contraseñas

Las contraseñas se hashean automáticamente usando bcrypt con un salt de 10 rondas antes de guardarlas en la base de datos.

```typescript
@BeforeInsert()
@BeforeUpdate()
async hashPassword() {
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
}
```

### Validación de Contraseñas

```typescript
async validatePassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
}
```

## 📋 Validaciones

### Registro

- **name**: Requerido, string
- **lastname**: Requerido, string
- **email**: Requerido, formato email válido, único
- **password**: Requerido, mínimo 6 caracteres
- **role**: Requerido, debe ser 'client' o 'lawyer'
- **license**: Solo para lawyers, requerido, único

### Login

- **email**: Requerido, formato email válido
- **password**: Requerido, mínimo 6 caracteres

## 🎯 Próximos Pasos

1. ✅ Módulo de autenticación básico
2. ⏳ Endpoints de perfil de usuario
3. ⏳ Módulo de consultas/casos legales
4. ⏳ Sistema de reviews y ratings
5. ⏳ Sistema de mensajería
6. ⏳ Sistema de pagos
7. ⏳ Notificaciones push

## 📞 Contacto

Para más información o dudas, contacta al equipo de desarrollo.
