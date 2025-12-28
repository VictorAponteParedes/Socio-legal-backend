# 📋 Flujo de Registro y Perfil de Abogado

## 🎯 Filosofía de Diseño

**Registro Simple → Completar Perfil Después**

### **Por qué este enfoque es mejor:**
1. ✅ **Menos fricción** en el registro
2. ✅ **Mayor tasa de conversión** (más abogados se registran)
3. ✅ **No abrumar** al usuario con 20 campos
4. ✅ **UX progresiva** (completan información gradualmente)

---

## 📝 Flujo Paso a Paso

### **PASO 1: Registro Inicial (Mínimo)**

**Endpoint:**
```http
POST http://localhost:3000/api/auth/register
```

**Datos Obligatorios:**
```json
{
  "name": "María",
  "lastname": "González",
  "email": "maria@example.com",
  "password": "Admin123.",
  "role": "lawyer",
  "license": "MP-12345"  // ← ÚNICO campo específico de abogado
}
```

**Backend crea:**
- ✅ User en tabla `users`
- ✅ Lawyer en tabla `lawyers` con:
  - `license`: "MP-12345"
  - `bio`: `null`
  - `specializations`: `[]` (vacío)
  - `profileCompleted`: `false` ← Nuevo campo
  - `yearsOfExperience`: 0
  - `rating`: 0
  - etc.

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid",
    "name": "María",
    "email": "maria@example.com",
    "role": "lawyer"
  },
  "token": "jwt-token"
}
```

✅ **El abogado YA puede entrar a la app**

---

### **PASO 2: Primera vez que abre la App**

**Frontend verifica:**
```typescript
// Al cargar el perfil del abogado
const lawyerProfile = await getLawyerProfile(userId);

if (!lawyerProfile.profileCompleted) {
  // Mostrar banner o modal:
  // "¡Completa tu perfil para que los clientes te encuentren!"
  navigation.navigate('CompleteProfile');
}
```

**Banner en Home:**
```
┌─────────────────────────────────────────────┐
│ ⚠️ Completa tu perfil                       │
│ Añade especialidades y más información     │
│ para aparecer en búsquedas de clientes     │
│                              [Completar →] │
└─────────────────────────────────────────────┘
```

---

### **PASO 3: Completar Perfil**

**Pantalla de "Completar Perfil" con campos:**

1. **Especialidades** (selección múltiple)
   - Derecho Civil ✓
   - Derecho Penal ✓
   - Derecho Laboral ✗
   
2. **Biografía**
   ```
   Cuéntanos sobre tu experiencia profesional...
   (Mínimo 50 caracteres)
   ```

3. **Años de Experiencia**
   ```
   [Selector: 0-50 años]
   ```

4. **Idiomas** (chips)
   - Español ✓
   - Guaraní ✓
   - Inglés ✗

5. **Dirección de Oficina** (opcional)
   ```
   Av. Mariscal López 123, Asunción
   ```

6. **Ciudad/País**
   ```
   Ciudad: Asunción
   País: Paraguay
   ```

**Endpoint para actualizar perfil:**
```http
PATCH http://localhost:3000/api/lawyers/:id/complete-profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "specializationIds": [1, 2],  // IDs de las especialidades
  "bio": "Abogado con 10 años de experiencia...",
  "yearsOfExperience": 10,
  "languages": ["Español", "Guaraní"],
  "officeAddress": "Av. Mariscal López 123",
  "city": "Asunción",
  "country": "Paraguay",
  "profileCompleted": true  // ← Marca como completado
}
```

**Backend actualiza:**
```typescript
// En LawyersService.completeProfile()
async completeProfile(lawyerId: string, data: CompleteProfileDto) {
  const lawyer = await this.lawyerRepository.findOne({ 
    where: { id: lawyerId } 
  });

  // Obtener especialidades
  const specializations = await this.specializationRepository
    .findByIds(data.specializationIds);

  // Actualizar
  lawyer.specializations = specializations;
  lawyer.bio = data.bio;
  lawyer.yearsOfExperience = data.yearsOfExperience;
  lawyer.languages = data.languages;
  lawyer.officeAddress = data.officeAddress;
  lawyer.city = data.city;
  lawyer.country = data.country;
  lawyer.profileCompleted = true;  // ← Importante

  return await this.lawyerRepository.save(lawyer);
}
```

---

## 🎨 UI/UX del Frontend

### **Estado: Perfil Incompleto**
```
┌────────────────────────────────────┐
│ 👤 Mi Perfil                       │
├────────────────────────────────────┤
│                                    │
│ ⚠️ Tu perfil está incompleto       │
│                                    │
│ Progreso: ████░░░░ 40%             │
│                                    │
│ Falta completar:                   │
│ • Especialidades                   │
│ • Biografía                        │
│ • Años de experiencia              │
│                                    │
│     [Completar Ahora →]            │
│                                    │
└────────────────────────────────────┘
```

### **Estado: Perfil Completo**
```
┌────────────────────────────────────┐
│ 👤 Mi Perfil                       │
├────────────────────────────────────┤
│                                    │
│ ✅ Perfil completo                 │
│                                    │
│ María González                     │
│ MP-12345                           │
│                                    │
│ 🎓 Especialidades:                 │
│ • Derecho Civil                    │
│ • Derecho Penal                    │
│                                    │
│ ⭐ Rating: 4.8 (24 reviews)        │
│                                    │
│     [Editar Perfil]                │
│                                    │
└────────────────────────────────────┘
```

---

## 🔍 Búsqueda de Abogados (Clientes)

**Los clientes SOLO ven abogados con perfil completo:**

```typescript
// En LawyersService
async findForClients(filters: SearchFilters) {
  return await this.lawyerRepository.find({
    where: {
      profileCompleted: true,  // ← Filtro importante
      isAvailable: true,
      // otros filtros...
    },
    relations: ['specializations', 'user'],
  });
}
```

---

## 📊 Campos del Perfil

| Campo | Obligatorio en Registro | Se completa después |
|-------|------------------------|---------------------|
| name | ✅ | ❌ |
| lastname | ✅ | ❌ |
| email | ✅ | ❌ |
| password | ✅ | ❌ |
| license | ✅ | ❌ |
| specializations | ❌ | ✅ |
| bio | ❌ | ✅ |
| yearsOfExperience | ❌ | ✅ |
| languages | ❌ | ✅ |
| officeAddress | ❌ | ⚪ (Opcional) |
| city | ❌ | ✅ |
| country | ❌ | ✅ |

---

## 🎯 Reglas de Negocio

### **Abogado puede:**
- ✅ Registrarse sin especialidades
- ✅ Ver la app inmediatamente
- ✅ Completar su perfil cuando quiera
- ⚠️ NO aparecerá en búsquedas hasta completar perfil

### **Cliente puede:**
- ✅ Registrarse aún más simple (solo name, email, password)
- ✅ Buscar abogados
- ✅ Ver SOLO abogados con `profileCompleted = true`

### **Especialidades:**
- ✅ Se crean independientemente (catálogo)
- ✅ Admin/Sistema puede crear nuevas
- ✅ Abogados seleccionan de la lista existente
- ✅ Un abogado puede tener múltiples especialidades
- ✅ Una especialidad puede tener múltiples abogados

---

## ✅ Resumen del Flujo

```
1. Abogado se registra
   ├─→ Solo: name, email, password, license
   └─→ profileCompleted = false

2. Entra a la app
   ├─→ Ve banner: "Completa tu perfil"
   └─→ Puede navegar, pero no aparece en búsquedas

3. Completa perfil
   ├─→ Selecciona especialidades
   ├─→ Añade bio, experiencia, etc.
   └─→ profileCompleted = true

4. Ahora sí aparece en búsquedas
   └─→ Los clientes pueden verlo y contactarlo
```

---

## 🚀 Próximos Endpoints a Crear

```typescript
// LawyersController
GET    /api/lawyers/profile          // Ver mi perfil
PATCH  /api/lawyers/profile          // Actualizar mi perfil
POST   /api/lawyers/profile/complete // Completar perfil
GET    /api/lawyers/search           // Buscar abogados (solo completos)
```

---

¿Te gusta este flujo? Es exactamente como lo planteaste y sigue las mejores prácticas de UX. 🎉
