# 📝 Guía de Path Aliases

## ✅ Configuración Completada

Hemos configurado **path aliases** para usar `@/` en lugar de rutas relativas.

## 🎯 Configuración

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## 📦 Uso de Imports

### ❌ Antes (rutas relativas)
```typescript
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../../common/constants/user.constants';
import { AuthService } from '../auth.service';
```

### ✅ Ahora (con @/)
```typescript
import { User } from '@/users/entities/user.entity';
import { UserRole } from '@/common/constants/user.constants';
import { AuthService } from '@/auth/auth.service';
```

## 🗂️ Estructura de Imports

```typescript
// Entidades
import { User } from '@/users/entities/user.entity';
import { Client } from '@/clients/client.entity';
import { Lawyer } from '@/lawyers/lawyer.entity';
import { Specialization } from '@/specializations/specialization.entity';

// Common
import { UserRole, UserStatus } from '@/common/constants/user.constants';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

// Config
import { envConfig } from '@/config/env.config';

// Modules
import { AuthService } from '@/auth/auth.service';
import { SpecializationsService } from '@/specializations/specializations.service';
```

## 📋 Reglas

1. **Siempre usa `@/`** para imports entre módulos
2. **Usa rutas relativas** solo para archivos en el mismo directorio
   ```typescript
   // En auth.module.ts
   import { AuthController } from './auth.controller'; // ✅ Mismo directorio
   import { JwtStrategy } from './strategies/jwt.strategy'; // ✅ Subdirectorio
   import { User } from '@/users/entities/user.entity'; // ✅ Otro módulo
   ```

3. **No uses `../../`** nunca más ❌

## 🎨 Ventajas

- ✅ **Más legible**: Sabes exactamente dónde está el archivo
- ✅ **Más mantenible**: No se rompe al mover archivos
- ✅ **Más limpio**: No más `../../../`
- ✅ **Mejor autocompletado**: VSCode entiende mejor los imports

## 🔧 Archivos Actualizados

- ✅ `tsconfig.json` - Configuración de paths
- ✅ `src/users/entities/user.entity.ts`
- ✅ `src/clients/client.entity.ts`
- ✅ `src/lawyers/lawyer.entity.ts`
- ✅ `src/auth/auth.service.ts`
- ✅ `src/auth/auth.module.ts`
- ✅ `src/auth/dto/register.dto.ts`
- ✅ `src/common/validators/is-license-required.validator.ts`
- ✅ `src/app.module.ts`

## 💡 Tip

VSCode autocompleta los imports usando `@/` automáticamente. Solo escribe:
```typescript
import { User } // Y presiona Ctrl+Space
```

¡Listo! 🎉
