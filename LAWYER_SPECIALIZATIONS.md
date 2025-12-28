# 🎓 Relación Lawyer ←→ Specializations

## 📊 Estructura de Tablas

```
┌──────────────────┐         ┌─────────────────────────┐         ┌──────────────────────┐
│    lawyers       │         │ lawyer_specializations  │         │  specializations     │
├──────────────────┤         ├─────────────────────────┤         ├──────────────────────┤
│ id (PK)          │←────────│ lawyer_id (FK)          │         │ id (PK)              │
│ user_id (FK)     │         │ specialization_id (FK)  │────────→│ name (UNIQUE)        │
│ license          │         └─────────────────────────┘         │ description          │
│ bio              │                                             │ created_at           │
│ rating           │                                             │ updated_at           │
│ ...              │                                             └──────────────────────┘
└──────────────────┘
```

**Relación:** Many-to-Many
- Un abogado puede tener **muchas especialidades**
- Una especialidad puede ser de **muchos abogados**

## 📝 Ejemplos de Uso

### 1. **Crear Especialidades**

```http
POST http://localhost:3000/api/specializations
Content-Type: application/json

{
  "name": "Derecho Civil",
  "description": "Especialización en casos civiles, contratos y sucesiones"
}
```

```http
POST http://localhost:3000/api/specializations
Content-Type: application/json

{
  "name": "Derecho Penal",
  "description": "Defensa penal y procesos judiciales"
}
```

```http
POST http://localhost:3000/api/specializations
Content-Type: application/json

{
  "name": "Derecho Laboral",
  "description": "Relaciones laborales y despidos"
}
```

### 2. **Listar Especialidades**

```http
GET http://localhost:3000/api/specializations
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Derecho Civil",
    "description": "Especialización en casos civiles..."
  },
  {
    "id": 2,
    "name": "Derecho Penal",
    "description": "Defensa penal..."
  }
]
```

### 3. **Asignar Especialidades a un Abogado**

Para esto necesitarás crear un endpoint en el servicio de Lawyers. Por ahora, se puede hacer directamente con TypeORM:

```typescript
// En LawyersService (cuando lo creemos)
async addSpecializations(lawyerId: string, specializationIds: number[]) {
  const lawyer = await this.lawyerRepository.findOne({
    where: { id: lawyerId },
    relations: ['specializations'],
  });

  const specializations = await this.specializationRepository.findByIds(specializationIds);
  
  lawyer.specializations = specializations;
  return await this.lawyerRepository.save(lawyer);
}
```

### 4. **Consultar Abogados con sus Especialidades**

```sql
-- En DBeaver o consulta SQL
SELECT 
  u.name, 
  u.lastname,
  l.license,
  s.name as specialization
FROM lawyers l
INNER JOIN users u ON u.id = l.user_id
INNER JOIN lawyer_specializations ls ON ls.lawyer_id = l.id
INNER JOIN specializations s ON s.id = ls.specialization_id;
```

### 5. **Buscar Abogados por Especialidad**

```typescript
// En LawyersService
async findBySpecialization(specializationId: number) {
  return await this.lawyerRepository
    .createQueryBuilder('lawyer')
    .innerJoin('lawyer.specializations', 'spec')
    .where('spec.id = :specializationId', { specializationId })
    .getMany();
}
```

## 🎯 Próximos Endpoints a Crear

Para que esto sea funcional desde el frontend, necesitarás crear:

### **LawyersModule** (próximo paso)

```typescript
// Endpoints sugeridos:
GET    /api/lawyers                    // Listar abogados
GET    /api/lawyers/:id                // Ver abogado específico
GET    /api/lawyers/:id/specializations // Ver especialidades de un abogado
POST   /api/lawyers/:id/specializations // Asignar especialidades
DELETE /api/lawyers/:id/specializations/:specId // Quitar especialidad
GET    /api/lawyers/specialization/:id // Buscar por especialidad
```

## 📊 Diagrama de Flujo

```
1. Admin crea especialidades
   └─→ specializations table

2. Abogado se registra
   └─→ users table + lawyers table

3. Abogado selecciona sus especialidades
   └─→ lawyer_specializations table
       (crea relaciones)

4. Cliente busca abogados
   └─→ Filtra por especialización
       └─→ JOIN con lawyer_specializations
```

## 🧪 Testing

### **Paso 1:** Crear especialidades
```bash
curl -X POST http://localhost:3000/api/specializations \
  -H "Content-Type: application/json" \
  -d '{"name": "Derecho Civil"}'

curl -X POST http://localhost:3000/api/specializations \
  -H "Content-Type: application/json" \
  -d '{"name": "Derecho Penal"}'
```

### **Paso 2:** Registrar abogado
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María",
    "lastname": "González",
    "email": "maria@example.com",
    "password": "Admin123.",
    "role": "lawyer",
    "license": "MP-12345"
  }'
```

### **Paso 3:** Ver en base de datos
```sql
-- Ver todas las relaciones
SELECT * FROM lawyer_specializations;

-- Ver abogados con sus especialidades
SELECT 
  l.id,
  u.name,
  s.name as specialization
FROM lawyers l
INNER JOIN users u ON u.id = l.user_id
LEFT JOIN lawyer_specializations ls ON ls.lawyer_id = l.id
LEFT JOIN specializations s ON s.id = ls.specialization_id;
```

## ✅ Ventajas de esta Arquitectura

1. ✅ **Normalización**: No hay duplicación de datos
2. ✅ **Flexibilidad**: Fácil añadir/quitar especialidades
3. ✅ **Escalable**: Puedes añadir más campos a especialidades
4. ✅ **Performance**: Búsquedas eficientes con índices
5. ✅ **Relacional**: Puedes consultar en ambas direcciones

---

¿Listo para probar? El servidor debería haber creado la tabla `lawyer_specializations` automáticamente. 🚀
