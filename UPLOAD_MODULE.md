# 📸 Upload Module - Documentación

## 🎯 Módulo Genérico de Upload de Imágenes

Este módulo es **independiente y reutilizable** para subir imágenes en cualquier parte de la aplicación (lawyers, clients, etc.).

---

## 📦 Endpoints Disponibles

### **POST /api/upload/profile-picture**
🔒 **Privado** - Requiere JWT

**Descripción:** Sube una imagen de perfil para el usuario autenticado.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
file: [ARCHIVO_IMAGEN] (campo llamado "file")
```

**Validaciones:**
- ✅ Tipos permitidos: `.jpg`, `.jpeg`, `.png`, `.webp`
- ✅ Tamaño máximo: **5MB**
- ✅ Solo un archivo a la vez

**Respuesta (200 OK):**
```json
{
  "message": "Imagen de perfil actualizada exitosamente",
  "url": "/uploads/profiles/uuid-generated.jpg",
  "fullUrl": "http://localhost:3000/uploads/profiles/uuid-generated.jpg"
}
```

**Error (400 Bad Request):**
```json
{
  "message": "Solo se aceptan imágenes: JPG, PNG, WEBP",
  "statusCode": 400
}
```

---

## 🧪 Testing con Postman

### **Paso 1: Login y obtener token**

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "maria.gonzalez@example.com",
  "password": "Admin123."
}
```

**Copia el token** de la respuesta.

---

### **Paso 2: Subir imagen de perfil**

1. **Crear nuevo request en Postman**
2. **Método:** `POST`
3. **URL:** `http://localhost:3000/api/upload/profile-picture`
4. **Headers:**
   - Key: `Authorization`
   - Value: `Bearer {tu-token-aqui}`

5. **Body:**
   - Selecciona **form-data** (NO raw, NO x-www-form-urlencoded)
   - Añade un campo:
     - Key: `file` ← IMPORTANTE: debe llamarse "file"
     - Type: **File** (click en el dropdown al lado de "Key")
     - Value: Click en "Select Files" y elige una imagen

6. **Click Send** 🚀

**Respuesta esperada:**
```json
{
  "message": "Imagen de perfil actualizada exitosamente",
  "url": "/uploads/profiles/123e4567-e89b-12d3-a456-426614174000.jpg",
  "fullUrl": "http://localhost:3000/uploads/profiles/123e4567-e89b-12d3-a456-426614174000.jpg"
}
```

---

### **Paso 3: Verificar la imagen**

**Opción A: En el navegador**
```
http://localhost:3000/uploads/profiles/123e4567-e89b-12d3-a456-426614174000.jpg
```

**Opción B: Ver en el perfil**
```http
GET http://localhost:3000/api/lawyers/me/profile
Authorization: Bearer {token}
```

Verás:
```json
{
  "user": {
    "profilePicture": "/uploads/profiles/123e4567-e89b-12d3-a456-426614174000.jpg"
  }
}
```

---

## 🔄 Flujo Completo

```
1. Usuario se loguea → Obtiene token
                                      
2. Sube imagen → POST /upload/profile-picture
                                      
3. Backend guarda archivo en /uploads/profiles/
                                      
4. Backend actualiza users.profilePicture
                                      
5. Retorna URL de la imagen
                                      
6. Frontend puede mostrar:
   http://localhost:3000/uploads/profiles/...
```

---

## 📊 Estructura de Carpetas

```
socio-legal-backend/
├── uploads/            ← Archivos subidos
│   ├── profiles/       ← Fotos de perfil
│   └── documents/      ← Documentos (futuro)
├── src/
│   ├── upload/         ← Módulo de Upload
│   │   ├── upload.controller.ts
│   │   ├── upload.service.ts
│   │   └── upload.module.ts
│   └── ...
```

---

## 🎨 Uso en el Frontend (React Native)

### **Seleccionar imagen**

```typescript
import { launchImageLibrary } from 'react-native-image-picker';

const pickImage = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8,
  });

  if (result.assets && result.assets[0]) {
    uploadProfilePicture(result.assets[0]);
  }
};
```

### **Subir imagen**

```typescript
const uploadProfilePicture = async (image: any) => {
  const formData = new FormData();
  
  formData.append('file', {
    uri: image.uri,
    type: image.type,
    name: image.fileName || 'profile.jpg',
  });

  try {
    const response = await fetch('http://10.0.2.2:3000/api/upload/profile-picture', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    console.log('Image uploaded:', data.url);
    
    // Actualizar estado local con la nueva URL
    setProfilePicture(data.fullUrl);
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

### **Mostrar imagen**

```tsx
<Image 
  source={{ 
    uri: profilePicture || 'https://via.placeholder.com/150' 
  }}
  style={{ width: 150, height: 150, borderRadius: 75 }}
/>
```

---

## 🛠️ Características Implementadas

### ✅ **Eliminación Automática**
- Si subes una nueva foto, la anterior se elimina automáticamente
- No se acumulan archivos antiguos

### ✅ **Nombres Únicos**
- Usa UUIDs para evitar conflictos
- Mantiene la extensión original

### ✅ **Validación Robusta**
- Tipo de archivo
- Tamaño máximo
- Manejo de errores

### ✅ **URLs Públicas**
- Las imágenes son accesibles sin autenticación
- Ideal para mostrar en cualquier parte

### ✅ **Reutilizable**
- Puedes usar el mismo endpoint para lawyers y clients
- La imagen se guarda en `users.profilePicture`
- Accesible desde cualquier entidad relacionada con User

---

## 🔐 Seguridad

### **Protección JWT**
- Solo usuarios autenticados pueden subir
- Cada usuario solo puede actualizar su propia foto

### **Validación de Archivos**
- Solo imágenes permitidas
- Límite de tamaño
- Nombres sanitizados (UUID)

### **Aislamiento**
- Cada usuario tiene su propia imagen
- La imagen anterior se elimina al subir nueva

---

## 🚀 Próximas Mejoras (Opcional)

### **1. Redimensionamiento Automático**
```bash
npm install sharp
```

### **2. Almacenamiento en la Nube (S3, Cloudinary)**
```bash
npm install @aws-sdk/client-s3
# o
npm install cloudinary
```

### **3. Upload de Documentos**
- Añadir endpoint `/upload/document`
- Para licencias, certificados, etc.

### **4. Upload Múltiple**
- Galería de fotos para casos legales
- Múltiples documentos adjuntos

---

## 📝 Notas Importantes

1. **La foto se guarda en `users.profilePicture`**
   - Tanto lawyers como clients tienen acceso
   - Es un campo común en la tabla base

2. **URLs relativas vs absolutas**
   - BD guarda: `/uploads/profiles/uuid.jpg`
   - Frontend usa: `http://localhost:3000/uploads/profiles/uuid.jpg`

3. **Producción**
   - En producción, considera usar S3 o Cloudinary
   - Más seguro y escalable que guardar localmente

4. **Gitignore**
   - La carpeta `uploads/` debe estar en `.gitignore`
   - No subir fotos de usuarios al repositorio

---

¿Listo para probar? ¡Sube tu primera imagen de perfil! 📸🎉
