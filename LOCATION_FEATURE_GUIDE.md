# Backend Location Feature - Implementation Guide

## ✅ Completed Steps

### 1. Database Entity (Lawyer)
✅ Added the following fields to `src/lawyers/lawyer.entity.ts`:
- `latitude` (decimal, 10,7) - Stores GPS latitude
- `longitude` (decimal, 10,7) - Stores GPS longitude  
- `city` (varchar, 100) - Already existed
- `country` (varchar, 100) - Already existed

### 2. DTO Created
✅ Created `src/lawyers/dto/update-location.dto.ts` with validation:
- latitude: -90 to 90
- longitude: -180 to 180
- city: string
- country: string

### 3. Controller Endpoint
✅ Added to `src/lawyers/lawyers.controller.ts`:
```
PATCH /lawyers/me/location
- Authenticated lawyers only
- Updates location data for the current user
```

### 4. Service Method
✅ Implemented `updateLocation()` in `src/lawyers/lawyers.service.ts`:
- Validates user is a lawyer
- Updates latitude, longitude, city, country
- Returns updated lawyer profile

---

## 🚀 Next Steps

### Step 1: Run Database Migration

Since we added new columns to the `lawyers` table, you need to sync the database schema.

**Option A: Auto-sync (Development only)**
If `synchronize: true` is enabled in your TypeORM config, the columns will be created automatically when you restart the server.

**Option B: Generate Migration (Recommended for Production)**
```bash
cd /Users/victoraponte/Desktop/Proyecto\ Personales/socio-legal-backend

# Generate migration
npm run typeorm migration:generate -- -n AddLocationFieldsToLawyer

# Run migration
npm run typeorm migration:run
```

### Step 2: Start the Backend Server

```bash
cd /Users/victoraponte/Desktop/Proyecto\ Personales/socio-legal-backend
npm run start:dev
```

### Step 3: Test the Endpoint

```bash
# Test update location endpoint
curl -X PATCH http://localhost:3000/lawyers/me/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "latitude": -25.2637,
    "longitude": -57.5759,
    "city": "Asunción",
    "country": "Paraguay"
  }'
```

Expected response:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "license": "123",
  "bio": "...",
  "city": "Asunción",
  "country": "Paraguay",
  "latitude": -25.2637,
  "longitude": -57.5759,
  "profileCompleted": true,
  ...
}
```

---

## 🎯 Integration with Frontend

The frontend is already configured to call this endpoint:

**File**: `src/services/lawyer.service.ts`
```typescript
updateLocation(lawyerId: number, locationData: UpdateLocationData): Promise<any>
```

**Called from**: `src/screens/lawyer/LocationSettings/hooks/useLocationSettings.ts`

Once the backend is running, the frontend will be able to:
1. Get current GPS coordinates
2. Send them to `PATCH /lawyers/me/location`
3. Display success/error messages

---

## 🔮 Future Enhancements (Optional)

### Add Proximity Search Endpoint

To enable clients to find lawyers within a specific distance:

**1. Add endpoint to `lawyers.controller.ts`:**
```typescript
@Get('nearby')
@HttpCode(HttpStatus.OK)
findNearby(
  @Query('lat') lat: number,
  @Query('lng') lng: number,
  @Query('radius') radius: number = 30, // km
) {
  return this.lawyersService.findNearby(lat, lng, radius);
}
```

**2. Implement Haversine formula in `lawyers.service.ts`:**
```typescript
async findNearby(
  lat: number,
  lng: number,
  radiusKm: number = 30,
): Promise<Lawyer[]> {
  const lawyers = await this.lawyerRepository
    .createQueryBuilder('lawyer')
    .leftJoinAndSelect('lawyer.user', 'user')
    .leftJoinAndSelect('lawyer.specializations', 'specializations')
    .where('lawyer.profileCompleted = :completed', { completed: true })
    .andWhere('lawyer.isAvailable = :available', { available: true })
    .andWhere('lawyer.latitude IS NOT NULL')
    .andWhere('lawyer.longitude IS NOT NULL')
    .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
    .getMany();

  // Calculate distance using Haversine formula
  const results = lawyers
    .map((lawyer) => {
      const distance = this.calculateDistance(
        lat,
        lng,
        lawyer.latitude,
        lawyer.longitude,
      );
      return { lawyer, distance };
    })
    .filter(({ distance }) => distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .map(({ lawyer, distance }) => ({
      ...lawyer,
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal
    }));

  return results;
}

private calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = this.toRad(lat2 - lat1);
  const dLon = this.toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

private toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

### Add Database Indexing (Performance)

For better performance with proximity searches, add spatial indexes to `lawyer.entity.ts`:

```typescript
@Index(['latitude', 'longitude'])
export class Lawyer {
  // ...
}
```

---

## 📝 Testing Checklist

- [ ] Backend server starts without errors
- [ ] Database columns `latitude` and `longitude` exist in `lawyers` table
- [ ] `PATCH /lawyers/me/location` returns 200 with valid token
- [ ] `PATCH /lawyers/me/location` returns 401 without token
- [ ] Frontend can successfully update location
- [ ] Lawyer profile shows updated location in `GET /lawyers/me/profile`

---

## 🐞 Troubleshooting

**Error: Column 'latitude' doesn't exist**
- Run database migration or restart server with `synchronize: true`

**Error: Cannot find module '@nestjs/swagger'**
- Already fixed - removed from DTO

**Error: 401 Unauthorized**
- Check JWT token is valid and not expired
- Verify Authorization header: `Bearer <token>`

**Error: User ID not found**
- Ensure the authenticated user has a lawyer profile
- Check that `user.userId` is correctly passed to service
