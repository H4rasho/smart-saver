# 🔐 Guía de Encriptación de Datos

Esta aplicación utiliza **encriptación AES-256-GCM** para proteger datos sensibles de los movimientos financieros del usuario.

## 📋 Datos Encriptados

Los siguientes campos se encriptan automáticamente:
- ✅ **name**: Descripción/nombre del movimiento
- ✅ **amount**: Monto del movimiento

## 🚀 Configuración Inicial

### 1. Generar Clave de Encriptación

Ejecuta el siguiente comando en tu terminal para generar una clave segura de 32 bytes:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Esto generará algo como:
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### 2. Configurar Variable de Entorno

Agrega la clave generada a tu archivo `.env`:

```bash
# .env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**⚠️ IMPORTANTE:**
- La clave debe tener exactamente **64 caracteres hexadecimales** (32 bytes)
- **NO compartas** esta clave en repositorios públicos
- **Guarda una copia segura** de esta clave - si la pierdes, no podrás descifrar datos existentes

### 3. Variables de Entorno en Producción

#### Vercel
```bash
vercel env add ENCRYPTION_KEY production
```

#### Netlify
Panel de control → Site settings → Environment variables

#### Railway/Render
Settings → Environment → Add Variable

## 🔧 Uso en el Código

La encriptación es **completamente transparente**. No necesitas hacer nada especial:

### Crear Movimiento
```typescript
import { createMovement } from '@/app/core/movements/repository/movements-repository';

// Los datos se encriptan automáticamente antes de guardar
await createMovement({
  clerk_id: userId,
  name: "Compra en supermercado", // ← Se encripta
  amount: 45.50, // ← Se encripta
  movement_type_id: 3,
  category_id: 5,
  // ...
});
```

### Leer Movimientos
```typescript
import { getAllMovements } from '@/app/core/movements/repository/movements-repository';

// Los datos se desencriptan automáticamente al leer
const movements = await getAllMovements(userId);
console.log(movements[0].name); // ← Ya desencriptado
console.log(movements[0].amount); // ← Ya desencriptado
```

## 📁 Arquitectura

```
lib/
├── encryption.ts              # Funciones de encriptación/desencriptación base
└── encrypted_movements.ts     # Helpers específicos para movimientos

app/core/movements/
└── repository/movements-repository.ts  # Uso automático de encriptación
```

### Componentes Clave

#### `lib/encryption.ts`
- `encrypt(text: string)`: Encripta texto plano
- `decrypt(encryptedData: string)`: Desencripta datos
- `encryptNumber(value: number)`: Encripta números
- `decryptNumber(encryptedValue: string)`: Desencripta números

#### `lib/encrypted_movements.ts`
- `encryptMovement()`: Encripta campos sensibles de un movimiento
- `decryptMovement()`: Desencripta campos sensibles de un movimiento
- `encryptMovements()`: Procesa arrays de movimientos

## 🔒 Seguridad

### Algoritmo: AES-256-GCM
- **AES-256**: Estándar de cifrado avanzado con clave de 256 bits
- **GCM**: Galois/Counter Mode - proporciona autenticación e integridad
- **IV aleatorio**: Cada valor encriptado tiene un vector de inicialización único
- **Auth Tag**: Verifica que los datos no han sido manipulados

### Formato de Datos Encriptados
```
iv:authTag:encryptedData
```
Ejemplo:
```
a1b2c3d4e5f6:9876543210ab:1234567890abcdef...
```

### Retrocompatibilidad
El sistema detecta datos no encriptados y los retorna sin error, facilitando la migración.

## 🔄 Migración de Datos Existentes

Si ya tienes datos en la base de datos sin encriptar, necesitas ejecutar una migración:

```typescript
// scripts/encrypt-existing-data.ts
import { db } from '@/database/database';
import { movements } from '@/app/core/movements/model/movement-model';
import { encrypt, encryptNumber } from '@/lib/encryption';

async function encryptExistingData() {
  const allMovements = await db.select().from(movements);
  
  for (const movement of allMovements) {
    await db
      .update(movements)
      .set({
        name: encrypt(movement.name),
        amount: encryptNumber(movement.amount as number),
      })
      .where(eq(movements.id, movement.id));
  }
  
  console.log(`✅ Encriptados ${allMovements.length} movimientos`);
}

encryptExistingData().catch(console.error);
```

## ⚠️ Consideraciones

### Rendimiento
- La encriptación/desencriptación es muy rápida (~1ms por operación)
- Para operaciones masivas, considera usar batch processing

### Búsquedas
- **No puedes buscar** por texto dentro de campos encriptados
- **No puedes ordenar** directamente por campos encriptados
- Considera mantener un hash del campo si necesitas búsquedas

### Backup
- **Siempre guarda** la `ENCRYPTION_KEY` en un lugar seguro
- Considera usar un gestor de secretos (AWS Secrets Manager, HashiCorp Vault, etc.)
- Sin la clave, los datos son **irrecuperables**

## 🧪 Testing

```typescript
import { encrypt, decrypt, encryptNumber, decryptNumber } from '@/lib/encryption';

describe('Encryption', () => {
  it('should encrypt and decrypt text', () => {
    const original = 'Compra de comida';
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);
    
    expect(decrypted).toBe(original);
    expect(encrypted).not.toBe(original);
  });

  it('should encrypt and decrypt numbers', () => {
    const original = 123.45;
    const encrypted = encryptNumber(original);
    const decrypted = decryptNumber(encrypted);
    
    expect(decrypted).toBe(original);
  });
});
```

## 📚 Referencias

- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [AES-GCM Explained](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

## 🆘 Troubleshooting

### Error: "ENCRYPTION_KEY not set"
**Solución**: Agrega la variable de entorno `ENCRYPTION_KEY` con una clave de 64 caracteres hex.

### Error: "Failed to decrypt data"
**Posibles causas**:
1. La clave de encriptación cambió
2. Los datos están corruptos
3. Los datos no fueron encriptados con esta clave

### Error: "ENCRYPTION_KEY must be 64 hex characters"
**Solución**: Genera una nueva clave con el comando proporcionado arriba.

---

**✨ ¡Tu aplicación ahora tiene encriptación de nivel empresarial!**

