# Arquitectura del Backend - SocioLegal

## Diagrama de Flujo de Autenticación

```
┌─────────────┐
│   Cliente   │
│  (Frontend) │
└──────┬──────┘
       │
       │ POST /api/auth/register
       │ { name, email, password, role, license? }
       ▼
┌──────────────────┐
│ AuthController   │
│  (Validación)    │
└────────┬─────────┘
         │
         │ RegisterDto validado
         ▼
┌──────────────────┐
│  AuthService     │
│  - Verifica email único
│  - Verifica license único (lawyers)
│  - Hash de password
│  - Crea Client o Lawyer
│  - Genera JWT token
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│       TypeORM Repository         │
├──────────────┬───────────────────┤
│ ClientRepo   │   LawyerRepo      │
└──────┬───────┴───────┬───────────┘
       │               │
       ▼               ▼
┌────────────────────────────────┐
│      PostgreSQL Database       │
│                                │
│  Table: users (STI - Single   │
│         Table Inheritance)     │
│                                │
│  Columns:                      │
│  - id (uuid)                   │
│  - name, lastname, email       │
│  - password (hashed)           │
│  - role (client | lawyer)      │
│  - status (active, etc.)       │
│  - phone, profilePicture       │
│  - address, city, country      │
│  - license (unique, lawyers)   │
│  - bio, specializations        │
│  - rating, totalReviews        │
│  - ... otros campos            │
└────────────────────────────────┘
```

## Modelo de Datos (UML)

```
┌─────────────────────────────────────┐
│            User (Abstract)          │
├─────────────────────────────────────┤
│ - id: UUID                          │
│ - name: string                      │
│ - lastname: string                  │
│ - email: string (unique)            │
│ - password: string (hashed)         │
│ - role: UserRole                    │
│ - status: UserStatus                │
│ - phone?: string                    │
│ - profilePicture?: string           │
│ - createdAt: Date                   │
│ - updatedAt: Date                   │
├─────────────────────────────────────┤
│ + hashPassword(): void              │
│ + validatePassword(pwd): boolean    │
│ + getFullName(): string             │
└──────────┬────────────┬─────────────┘
           │            │
           │            │
  ┌────────▼──────┐  ┌──▼──────────────┐
  │    Client     │  │     Lawyer      │
  ├───────────────┤  ├─────────────────┤
  │ - address?    │  │ - license*      │
  │ - city?       │  │ - bio?          │
  │ - country?    │  │ - specializations?│
  │ - preferences?│  │ - yearsOfExperi│
  └───────────────┘  │   ence?         │
                     │ - rating?       │
                     │ - totalReviews? │
                     │ - languages?    │
                     │ - isAvailable?  │
                     │ - officeAddress?│
                     └─────────────────┘
                     * required field
```

## Estructura de Módulos

```
┌────────────────────────────────────────────────────┐
│                  AppModule                         │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │         ConfigModule (Global)               │  │
│  │  - Carga variables de entorno               │  │
│  │  - Configuración centralizada               │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │        TypeOrmModule (Database)             │  │
│  │  - Conexión a PostgreSQL                    │  │
│  │  - Entidades: User, Client, Lawyer          │  │
│  │  - Sincronización automática (dev)          │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │            AuthModule                       │  │
│  │  ┌────────────────────────────────────┐     │  │
│  │  │      Passport + JWT Strategy       │     │  │
│  │  │  - Validación de tokens            │     │  │
│  │  │  - Extracción de usuario           │     │  │
│  │  └────────────────────────────────────┘     │  │
│  │                                             │  │
│  │  ┌────────────────────────────────────┐     │  │
│  │  │       AuthController               │     │  │
│  │  │  POST /auth/register               │     │  │
│  │  │  POST /auth/login                  │     │  │
│  │  └─────────────┬──────────────────────┘     │  │
│  │                │                            │  │
│  │                ▼                            │  │
│  │  ┌────────────────────────────────────┐     │  │
│  │  │        AuthService                 │     │  │
│  │  │  - register()                      │     │  │
│  │  │  - login()                         │     │  │
│  │  │  - validateUser()                  │     │  │
│  │  │  - generateToken()                 │     │  │
│  │  └────────────────────────────────────┘     │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  ┌────────────── (Próximos Módulos) ────────────┐ │
│  │  - UsersModule                               │ │
│  │  - CasesModule                               │ │
│  │  - ReviewsModule                             │ │
│  │  - MessagesModule                            │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

## Guards y Decoradores

```
┌─────────────────────────────────────┐
│     JwtAuthGuard                    │
│  - Verifica que el token JWT        │
│    sea válido                       │
│  - Extrae información del usuario   │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│     RolesGuard                      │
│  - Verifica que el usuario tenga    │
│    el rol requerido                 │
│  - Usa decorador @Roles()           │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Decoradores Personalizados         │
│                                     │
│  @CurrentUser()                     │
│  - Inyecta el usuario autenticado   │
│    en el parámetro del método       │
│                                     │
│  @Roles(...roles)                   │
│  - Define roles permitidos para     │
│    acceder al endpoint              │
└─────────────────────────────────────┘
```

## Flujo de Request Protegido

```
Request con JWT Token
       │
       ▼
┌──────────────────┐
│  JwtAuthGuard    │ ◄── Valida token
└────────┬─────────┘
         │ Token válido
         ▼
┌──────────────────┐
│  RolesGuard      │ ◄── Verifica rol
└────────┬─────────┘
         │ Rol permitido
         ▼
┌──────────────────┐
│   Controller     │ ◄── Ejecuta lógica
│   Method         │
└──────────────────┘
```

## Validación de DTOs

```
Request Body
     │
     ▼
┌─────────────────────┐
│   ValidationPipe    │ (Global)
│  - class-validator  │
│  - class-transformer│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│     DTO Validations             │
│                                 │
│  @IsNotEmpty()                  │
│  @IsString()                    │
│  @IsEmail()                     │
│  @MinLength(6)                  │
│  @IsEnum(UserRole)              │
│  @IsLicenseRequired() ◄─ Custom │
└──────────┬──────────────────────┘
           │
           │ Si falla validación
           ▼
   400 Bad Request
   { message: [...errors] }
           │
           │ Si pasa validación
           ▼
    Controller recibe DTO validado
```
