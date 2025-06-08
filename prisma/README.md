# Prisma Database Management für explore.dg

Dieses Dokument beschreibt, wie Sie Änderungen an der Datenbank mit Prisma durchführen.

## 📋 Übersicht

- **Schema**: `prisma/schema.prisma` - Definiert Datenmodelle
- **Migrationen**: `prisma/migrations/` - Versionierte DB-Änderungen  
- **Client**: Automatisch generiert aus dem Schema

## 🚀 Grundlegende Befehle

```bash
# Prisma Client generieren
npx prisma generate

# Migration erstellen und anwenden (Development)
npx prisma migrate dev --name <migration-name>

# Migration für Production anwenden
npx prisma migrate deploy

# Database Studio öffnen (GUI)
npx prisma studio

# Schema mit bestehender DB synchronisieren
npx prisma db pull
```

---

## ✨ Beispiel 1: Neues Model anlegen

### Schritt 1: Schema erweitern

Fügen Sie ein neues Model in `prisma/schema.prisma` hinzu:

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal
  category    String
  inStock     Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  orders      OrderItem[]

  @@map("products")
}

model OrderItem {
  id        String  @id @default(cuid())
  quantity  Int
  unitPrice Decimal @map("unit_price")

  // Relations
  productId String  @map("product_id")
  product   Product @relation(fields: [productId], references: [id])
  orderId   String  @map("order_id")
  order     Order   @relation(fields: [orderId], references: [id])

  @@map("order_items")
}

model Order {
  id         String      @id @default(cuid())
  orderDate  DateTime    @default(now()) @map("order_date")
  totalPrice Decimal     @map("total_price")
  status     OrderStatus @default(PENDING)

  // Relations
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id])
  items  OrderItem[]

  @@map("orders")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

// User Model erweitern
model User {
  // ... bestehende Felder ...
  
  // Neue Relation hinzufügen
  orders Order[]
  
  // ... Rest bleibt gleich ...
}
```

### Schritt 2: Migration erstellen

```bash
npx prisma migrate dev --name add-product-order-system
```

### Schritt 3: Client neu generieren

```bash
npx prisma generate
```

### Schritt 4: In Code verwenden

```typescript
// In einem Service
import { PrismaService } from '../prisma/prisma.service';

async createProduct(data: CreateProductDto) {
  return this.prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
    },
  });
}

async createOrder(userId: string, items: OrderItemDto[]) {
  return this.prisma.order.create({
    data: {
      userId,
      totalPrice: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}
```

---

## 🔧 Beispiel 2: Bestehendes Model bearbeiten

### Szenario: User Model erweitern

**Vor der Änderung:**
```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  firstName         String?  @map("first_name")
  lastName          String?  @map("last_name")
  role              UserRole @default(USER)
  isActive          Boolean  @default(true) @map("is_active")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

### Schritt 1: Schema ändern

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  firstName         String?  @map("first_name")
  lastName          String?  @map("last_name")
  
  // ✨ Neue Felder hinzufügen
  phoneNumber       String?  @map("phone_number")
  birthDate         DateTime? @map("birth_date")
  address           String?
  department        String?
  jobTitle          String?  @map("job_title")
  
  role              UserRole @default(USER)
  isActive          Boolean  @default(true) @map("is_active")
  
  // ✨ Index für bessere Performance
  @@index([department])
  @@index([email, isActive])
  
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

### Schritt 2: Migration mit Kommentar erstellen

```bash
npx prisma migrate dev --name add-user-profile-fields
```

### Schritt 3: Bei Breaking Changes - Daten migrieren

Wenn Sie bestehende Daten anpassen müssen, erstellen Sie ein **leeres SQL-Script**:

```bash
npx prisma migrate dev --create-only --name update-user-data
```

Bearbeiten Sie dann die generierte SQL-Datei in `prisma/migrations/`:

```sql
-- Migration generated by Prisma

-- Add new columns
ALTER TABLE "users" ADD COLUMN "phone_number" TEXT;
ALTER TABLE "users" ADD COLUMN "birth_date" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "address" TEXT;
ALTER TABLE "users" ADD COLUMN "department" TEXT;
ALTER TABLE "users" ADD COLUMN "job_title" TEXT;

-- Update existing data (optional)
UPDATE "users" SET "department" = 'General' WHERE "department" IS NULL;

-- Create indexes
CREATE INDEX "users_department_idx" ON "users"("department");
CREATE INDEX "users_email_is_active_idx" ON "users"("email", "is_active");
```

Dann Migration anwenden:
```bash
npx prisma migrate dev
```

---

## ⚠️ Wichtige Hinweise

### 🔄 Migration Workflow

1. **Immer** zuerst `schema.prisma` ändern
2. **Dann** Migration mit `prisma migrate dev` erstellen
3. **Client** mit `prisma generate` neu generieren
4. **Code** entsprechend anpassen

### 🚨 Production Deployment

```bash
# 1. Schema validieren
npx prisma validate

# 2. Migration generieren (lokal)
npx prisma migrate dev --name production-ready-feature

# 3. Auf Production Server
npx prisma migrate deploy
```

### 🔧 Troubleshooting

**Migration fehlgeschlagen?**
```bash
# Migration zurücksetzen
npx prisma migrate reset

# Oder spezifische Migration rückgängig machen
npx prisma db execute --file ./rollback.sql
```

**Schema nicht synchron?**
```bash
# Schema aus bestehender DB generieren
npx prisma db pull

# Danach überprüfen und Migration erstellen
npx prisma migrate dev --name sync-schema
```

### 📚 Nützliche Links

- [Prisma Schema Reference](https://pris.ly/d/prisma-schema)
- [Migration Guide](https://pris.ly/d/migrate)
- [Prisma Client API](https://pris.ly/d/client)
- [Best Practices](https://pris.ly/d/prisma-best-practices)

---

## 📊 Aktuelles Schema

Das aktuelle Schema enthält:
- **User** - Benutzer mit Microsoft OAuth2 Integration
- **GroupRoleMapping** - Rollen-Mapping für Microsoft-Gruppen
- **UserRole** Enum - ADMIN, USER, SALES, MODERATOR

Für neue Features erweitern Sie das Schema entsprechend den obigen Beispielen. 