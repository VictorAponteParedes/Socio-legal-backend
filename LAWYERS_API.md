# 📚 API Documentation - Lawyers Module

## 🎯 Endpoints Disponibles

### **Públicos** (Sin autenticación)
- GET `/api/lawyers` - Listar abogados
- GET `/api/lawyers/:id` - Ver abogado específico
- GET `/api/lawyers/specialization/:id` - Buscar por especialidad
- GET `/api/lawyers/city/:city` - Buscar por ciudad

### **Privados** (Requieren JWT + Role LAWYER)
- GET `/api/lawyers/me/profile` - Ver mi perfil
- GET `/api/lawyers/me/completion` - Verificar completitud del perfil
- POST `/api/lawyers/me/complete-profile` - Completar perfil
- PATCH `/api/lawyers/me/profile` - Actualizar perfil
- DELETE `/api/lawyers/me` - Desactivar cuenta (soft delete)
- POST `/api/lawyers/me/reactivate` - Reactivar cuenta

---

## 📋 Detalle de Endpoints

### 1. **GET /api/lawyers** - Listar Abogados
📌 **Público** - No requiere autenticación

**Descripción:** Retorna todos los abogados con perfil completo y activos.

**URL:**
```
GET http://localhost:3000/api/lawyers
```

**Respuesta (200 OK):**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "license": "MP-12345",
    "bio": "Abogado con 10 años de experiencia...",
    "yearsOfExperience": 10,
    "rating": 4.8,
    "totalReviews": 15,
    "languages": ["Español", "Guaraní"],
    "isAvailable": true,
    "officeAddress": "Av. Mariscal López 123",
    "city": "Asunción",
    "country": "Paraguay",
    "profileCompleted": true,
    "user": {
      "id": "uuid",
      "name": "María",
      "lastname": "González",
      "email": "maria@example.com",
      "role": "lawyer",
      "status": "active"
    },
    "specializations": [
      {
        "id": 1,
        "name": "Derecho Civil",
        "description": "..."
      },
      {
        "id": 2,
        "name": "Derecho Penal",
        "description": "..."
      }
    ]
  }
]
```

---

### 2. **GET /api/lawyers/:id** - Ver Abogado
📌 **Público** - No requiere autenticación

**Descripción:** Retorna información detallada de un abogado específico (solo si perfil completado).

**URL:**
```
GET http://localhost:3000/api/lawyers/uuid-del-abogado
```

**Respuesta (200 OK):** Mismo formato que el anterior pero un solo objeto.

**Error (404 Not Found):**
```json
{
  "message": "Abogado no encontrado",
  "statusCode": 404
}
```

---

### 3. **GET /api/lawyers/specialization/:id** - Buscar por Especialidad
📌 **Público**

**Descripción:** Retorna abogados que tienen una especialidad específica.

**URL:**
```
GET http://localhost:3000/api/lawyers/specialization/1
```

**Respuesta (200 OK):** Array de abogados con esa especialidad.

---

### 4. **GET /api/lawyers/city/:city** - Buscar por Ciudad
📌 **Público**

**Descripción:** Retorna abogados de una ciudad específica.

**URL:**
```
GET http://localhost:3000/api/lawyers/city/Asunci%C3%B3n
```

**Respuesta (200 OK):** Array de abogados de esa ciudad.

---

### 5. **GET /api/lawyers/me/profile** - Ver Mi Perfil
🔒 **Privado** - Requiere JWT + Role LAWYER

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL:**
```
GET http://localhost:3000/api/lawyers/me/profile
```

**Respuesta (200 OK):**
```json
{
  "id": "uuid",
  "license": "MP-12345",
  "bio": "...",
  "profileCompleted": false,  // ← Puede ser false
  "specializations": [],      // ← Puede estar vacío
  "user": { ... }
}
```

---

### 6. **GET /api/lawyers/me/completion** - Verificar Completitud
🔒 **Privado** - Requiere JWT + Role LAWYER

**Descripción:** Verifica qué campos faltan para completar el perfil.

**Headers:**
```
Authorization: Bearer {token}
```

**URL:**
```
GET http://localhost:3000/api/lawyers/me/completion
```

**Respuesta (200 OK):**
```json
{
  "completed": false,
  "missing": [
    "specializations",
    "bio",
    "yearsOfExperience",
    "languages",
    "city",
    "country"
  ]
}
```

**Si está completo:**
```json
{
  "completed": true,
  "missing": []
}
```

---

### 7. **POST /api/lawyers/me/complete-profile** - Completar Perfil
🔒 **Privado** - Requiere JWT + Role LAWYER

**Descripción:** Completa el perfil por primera vez (solo si profileCompleted = false).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**URL:**
```
POST http://localhost:3000/api/lawyers/me/complete-profile
```

**Body:**
```json
{
  "specializationIds": [1, 2],
  "bio": "Abogado con más de 10 años de experiencia en derecho civil y penal. He trabajado en casos de familia, sucesiones y defensa penal.",
  "yearsOfExperience": 10,
  "languages": ["Español", "Guaraní", "Inglés"],
  "city": "Asunción",
  "country": "Paraguay"
}
```

**Validaciones:**
- ✅ `specializationIds`: Obligatorio, array de números
- ✅ `bio`: Obligatorio, mínimo 50 caracteres
- ✅ `yearsOfExperience`: Obligatorio, entre 0 y 50
- ✅ `languages`: Obligatorio, array de strings
- ✅ `city`: Obligatorio
- ✅ `country`: Obligatorio

**Respuesta (200 OK):**
```json
{
  "id": "uuid",
  "profileCompleted": true,  // ← Ahora es true
  "specializations": [...],
  "bio": "...",
  "yearsOfExperience": 10,
  ...
}
```

**Error (400 Bad Request):**
```json
{
  "message": "El perfil ya está completado. Usa el endpoint de actualización.",
  "statusCode": 400
}
```

---

### 8. **PATCH /api/lawyers/me/profile** - Actualizar Perfil
🔒 **Privado** - Requiere JWT + Role LAWYER

**Descripción:** Actualiza campos del perfil (puede ser parcial).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**URL:**
```
PATCH http://localhost:3000/api/lawyers/me/profile
```

**Body (todos opcionales):**
```json
{
  "bio": "Nueva biografía actualizada...",
  "specializationIds": [1, 3],
  "yearsOfExperience": 12,
  "languages": ["Español", "Inglés"],
  "officeAddress": "Nueva dirección 456",
  "city": "Ciudad del Este",
  "country": "Paraguay",
  "isAvailable": false
}
```

**Respuesta (200 OK):** Perfil actualizado.

---

### 9. **DELETE /api/lawyers/me** - Desactivar Cuenta
🔒 **Privado** - Requiere JWT + Role LAWYER

**Descripción:** Soft delete - Marca la cuenta como inactiva (no la elimina).

**Headers:**
```
Authorization: Bearer {token}
```

**URL:**
```
DELETE http://localhost:3000/api/lawyers/me
```

**Respuesta (200 OK):**
```json
{
  "message": "Cuenta desactivada exitosamente"
}
```

**Efectos:**
- User.status = 'inactive'
- Lawyer.isAvailable = false
- NO aparecerá en búsquedas públicas

---

### 10. **POST /api/lawyers/me/reactivate** - Reactivar Cuenta
🔒 **Privado** - Requiere JWT + Role LAWYER

**Descripción:** Reactiva una cuenta previamente desactivada.

**Headers:**
```
Authorization: Bearer {token}
```

**URL:**
```
POST http://localhost:3000/api/lawyers/me/reactivate
```

**Respuesta (200 OK):**
```json
{
  "message": "Cuenta reactivada exitosamente"
}
```

**Efectos:**
- User.status = 'active'
- Lawyer.isAvailable = true
- Vuelve a aparecer en búsquedas

---

## 🧪 Testing con Postman

### **1. Registrar un Abogado**

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Pedro",
  "lastname": "Sánchez",
  "email": "pedro@example.com",
  "password": "Admin123.",
  "role": "lawyer",
  "license": "MP-99999"
}
```

**Copia el token** de la respuesta.

---

### **2. Ver Mi Perfil (Incompleto)**

```http
GET http://localhost:3000/api/lawyers/me/profile
Authorization: Bearer {token-copiado}
```

Verás `profileCompleted: false`.

---

### **3. Verificar Completitud**

```http
GET http://localhost:3000/api/lawyers/me/completion
Authorization: Bearer {token}
```

Verás qué campos faltan.

---

### **4. Completar Perfil**

```http
POST http://localhost:3000/api/lawyers/me/complete-profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "specializationIds": [1, 2],
  "bio": "Soy abogado especializado en derecho civil y penal con amplia experiencia en casos complejos.",
  "yearsOfExperience": 8,
  "languages": ["Español", "Guaraní"],
  "city": "Asunción",
  "country": "Paraguay"
}
```

---

### **5. Ver Perfil Completo**

```http
GET http://localhost:3000/api/lawyers/me/profile
Authorization: Bearer {token}
```

Ahora `profileCompleted: true`.

---

### **6. Listar Todos los Abogados (Público)**

```http
GET http://localhost:3000/api/lawyers
```

Ahora Pedro aparece en la lista.

---

### **7. Actualizar Perfil**

```http
PATCH http://localhost:3000/api/lawyers/me/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "bio": "Biografía actualizada con más detalles...",
  "yearsOfExperience": 10
}
```

---

### **8. Desactivar Cuenta**

```http
DELETE http://localhost:3000/api/lawyers/me
Authorization: Bearer {token}
```

---

### **9. Verificar que no aparece**

```http
GET http://localhost:3000/api/lawyers
```

Pedro ya NO aparece en la lista.

---

### **10. Reactivar Cuenta**

```http
POST http://localhost:3000/api/lawyers/me/reactivate
Authorization: Bearer {token}
```

Pedro vuelve a aparecer.

---

## 🔐 Autenticación

Todos los endpoints `/me/*` requieren:

1. **Header Authorization:**
   ```
   Authorization: Bearer {token-jwt}
   ```

2. **Token válido** obtenido del login/registro

3. **Role = LAWYER** en el payload del JWT

**Si falla:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

o

```json
{
  "message": "Forbidden resource",
  "statusCode": 403
}
```

---

## 📊 Resumen de Funcionalidades

| Funcionalidad | Endpoint | Método | Público |
|---------------|----------|--------|---------|
| Listar abogados | `/lawyers` | GET | ✅ |
| Ver abogado | `/lawyers/:id` | GET | ✅ |
| Buscar por especialidad | `/lawyers/specialization/:id` | GET | ✅ |
| Buscar por ciudad | `/lawyers/city/:city` | GET | ✅ |
| Ver mi perfil | `/lawyers/me/profile` | GET | 🔒 |
| Verificar completitud | `/lawyers/me/completion` | GET | 🔒 |
| Completar perfil | `/lawyers/me/complete-profile` | POST | 🔒 |
| Actualizar perfil | `/lawyers/me/profile` | PATCH | 🔒 |
| Desactivar cuenta | `/lawyers/me` | DELETE | 🔒 |
| Reactivar cuenta | `/lawyers/me/reactivate` | POST | 🔒 |

---

¡Todo listo para integrar con el frontend! 🎉
