# 🏗️ Nueva Arquitectura - Tablas Separadas

## ✅ Refactorización Completada

Hemos migrado exitosamente de **Single Table Inheritance** a **3 tablas separadas**.

## 📊 Estructura de Base de Datos

### **Tabla: `users` (Base Común)**
```sql
users
├── id (UUID, PK)
├── name (VARCHAR 100)
├── lastname (VARCHAR 100)
├── email (VARCHAR 255, UNIQUE)
├── password (VARCHAR 255, HASHED)
├── role (ENUM: 'client' | 'lawyer')
├── status (ENUM: 'active' | 'inactive' | 'suspended' | 'pending')
├── profilePicture (VARCHAR 255, nullable)
├── phone (VARCHAR 20, nullable)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)
```

### **Tabla: `clients` (Específico de Clientes)**
```sql
clients
├── id (UUID, PK)
├── user_id (UUID, FK → users.id, UNIQUE, CASCADE DELETE)
├── address (TEXT, nullable)
├── city (VARCHAR 100, nullable)
├── country (VARCHAR 100, nullable)
├── preferences (TEXT, nullable) -- JSON
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)
```

### **Tabla: `lawyers` (Específico de Abogados)**
```sql
lawyers
├── id (UUID, PK)
├── user_id (UUID, FK → users.id, UNIQUE, CASCADE DELETE)
├── license (VARCHAR 100, UNIQUE) -- Matrícula profesional
├── bio (TEXT, nullable)
├── specializations (ARRAY, nullable)
├── yearsOfExperience (INT, default 0)
├── rating (DECIMAL 3,2, default 0)
├── totalReviews (INT, default 0)
├── languages (ARRAY, nullable)
├── isAvailable (BOOLEAN, default true)
├── officeAddress (TEXT, nullable)
├── city (VARCHAR 100, nullable)
├── country (VARCHAR 100, nullable)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)
```

### **Tabla: `specializations`**
```sql
specializations
├── id (INT, PK, AUTO_INCREMENT)
├── name (VARCHAR 100, UNIQUE)
├── description (TEXT, nullable)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)
```

## 🔄 Relaciones

```
users (1) ←→ (1) clients
users (1) ←→ (1) lawyers
```

- **OneToOne bidireccional**
- **CASCADE DELETE**: Si eliminas un user, se elimina automáticamente su client/lawyer
- **UNIQUE en user_id**: Un usuario solo puede tener un perfil

## 📁 Estructura de Archivos

```
src/
├── users/
│   └── entities/
│       ├── user.entity.ts       # Usuario base
│       └── index.ts
│
├── clients/
│   └── client.entity.ts         # Perfil de cliente
│
├── lawyers/
│   └── lawyer.entity.ts         # Perfil de abogado
│
├── specializations/
│   ├── specialization.entity.ts
│   ├── dto/
│   │   ├── create-specialization.dto.ts
│   │   └── update-specialization.dto.ts
│   ├── specializations.controller.ts
│   ├── specializations.service.ts
│   └── specializations.module.ts
│
└── auth/
    ├── auth.controller.ts
    ├── auth.service.ts          # ✨ ACTUALIZADO
    ├── auth.module.ts            # ✨ ACTUALIZADO
    ├── dto/
    │   ├── register.dto.ts
    │   └── login.dto.ts
    └── strategies/
        └── jwt.strategy.ts
```

## 🎯 Flujo de Registro

### **Cliente:**
```
1. POST /api/auth/register
   {
     "name": "Juan",
     "lastname": "Pérez",
     "email": "juan@example.com",
     "password": "password123",
     "role": "client"
   }

2. Backend crea:
   - User en tabla `users`
   - Client en tabla `clients` (vinculado con user_id)

3. Retorna: user + token
```

### **Abogado:**
```
1. POST /api/auth/register
   {
     "name": "María",
     "lastname": "González",
     "email": "maria@example.com",
     "password": "password123",
     "role": "lawyer",
     "license": "MP-12345"
   }

2. Backend crea:
   - User en tabla `users`
   - Lawyer en tabla `lawyers` (vinculado con user_id)

3. Retorna: user + token
```

## ✨ Ventajas de la Nueva Arquitectura

### **1. Performance ✅**
- Queries más rápidas (menos JOIN necesarios)
- Índices más eficientes
- No hay campos NULL innecesarios

### **2. Escalabilidad ✅**
- Fácil añadir campos específicos sin afectar otras tablas
- Puedes añadir nuevas entidades (ej: `admins`) fácilmente
- Mejor control de relaciones

### **3. Mantenibilidad ✅**
- Código más limpio y organizado
- Separación clara de responsabilidades
- Facilita testing unitario

### **4. Integridad de Datos ✅**
- Constraints específicos por tabla
- CASCADE DELETE automático
- Validaciones en el nivel correcto

### **5. Queries Optimizadas ✅**
```typescript
// Obtener solo clientes (sin datos de lawyers)
const clients = await clientRepository.find({
  relations: ['user'],
});

// Obtener solo lawyers con specializations
const lawyers = await lawyerRepository.find({
  where: { specializations: Like('%Civil%') },
  relations: ['user'],
});
```

## 🧪 Testing en Postman

### **1. Registrar Cliente**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Juan",
  "lastname": "Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "client"
}
```

**Verifica en DB:**
```sql
SELECT * FROM users WHERE email = 'juan@example.com';
SELECT * FROM clients WHERE user_id = '<user_id>';
```

### **2. Registrar Abogado**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "María",
  "lastname": "González",
  "email": "maria@example.com",
  "password": "password123",
  "role": "lawyer",
  "license": "MP-12345"
}
```

**Verifica en DB:**
```sql
SELECT * FROM users WHERE email = 'maria@example.com';
SELECT * FROM lawyers WHERE user_id = '<user_id>';
```

### **3. Login**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

## 📊 Queries SQL Útiles

### **Ver todos los usuarios con sus roles:**
```sql
SELECT 
  u.id, 
  u.name, 
  u.email, 
  u.role,
  CASE 
    WHEN c.id IS NOT NULL THEN 'Has Client Profile'
    WHEN l.id IS NOT NULL THEN 'Has Lawyer Profile'
  END as profile_status
FROM users u
LEFT JOIN clients c ON c.user_id = u.id
LEFT JOIN lawyers l ON l.user_id = u.id;
```

### **Clientes con sus direcciones:**
```sql
SELECT 
  u.name, 
  u.lastname, 
  c.city, 
  c.country
FROM users u
INNER JOIN clients c ON c.user_id = u.id;
```

### **Abogados con mejor rating:**
```sql
SELECT 
  u.name, 
  u.lastname, 
  l.rating, 
  l.totalReviews,
  l.license
FROM users u
INNER JOIN lawyers l ON l.user_id = u.id
WHERE l.rating > 4.0
ORDER BY l.rating DESC;
```

## 🚀 Próximos Pasos

1. ✅ **Probar registro y login** con la nueva arquitectura
2. ⏳ **Crear endpoints de perfil** (GET, PATCH para clients y lawyers)
3. ⏳ **Migrar datos antiguos** si ya tienes usuarios en la BD antigua
4. ⏳ **Crear servicios específicos** (ClientsService, LawyersService)
5. ⏳ **Añadir relaciones** con casos, reviews, etc.

## ⚠️ Notas Importantes

1. **Migración de Datos**: Si tenías datos con la arquitectura anterior, necesitarás un script de migración
2. **Frontend**: El frontend sigue funcionando igual (solo recibe `user`)
3. **Token JWT**: No cambia, sigue usando user.id y user.role
4. **Performance**: Mucho mejor para operaciones específicas de cada rol

---

¿Listo para probar? 🎉
