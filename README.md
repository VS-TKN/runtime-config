# runtime-config

Librería de configuración en tiempo de ejecución para microservicios Node.js / TypeScript.

Permite obtener configuración sin hardcodear valores, con soporte para múltiples fuentes (providers) y fallback automático.

## ¿Para qué sirve?

* Centralizar configuración de aplicaciones
* Cambiar valores sin redeploy
* Soportar distintos entornos (local, QA, prod)
* Evitar `process.env` dispersos por el código

## ¿Qué tipo de configuración maneja?

La librería está pensada para resolver, entre otros, los siguientes casos:

* **Secrets** Tokens, API keys, credenciales, passwords.
* **Variables de entorno dinámicas** Feature flags, toggles operativos, URLs, timeouts, thresholds.
* **Configuración por entorno** Valores distintos para `local`, `qa`, `stage`, `prod` sin cambiar el código.

## Concepto

La librería expone un `ConfigClient` que consulta uno o más `ConfigProvider`.

```
App → ConfigClient → Provider (AWS / memoria / futuro)
```

Si un provider falla, se puede usar otro como fallback.

### Modelo mental (simple)

```
Microservicio
     ↓
 ConfigClient
     ↓
 Providers (ordenados)
     ↓
 Valor de configuración
```

## ¿Qué pasa si una configuración no existe?

`runtime-config` soporta fallback automático entre providers.

**Ejemplo:**

1. Se intenta obtener el valor desde una fuente remota (ej. AWS AppConfig)
2. Si no existe o falla → se usa un provider alternativo (ej. memoria o env)
3. Si ningún provider responde → el cliente decide el comportamiento (error o default)

Esto evita caídas del servicio por dependencias externas.

## Providers incluidos

### InMemoryProvider
Para desarrollo local o tests.

### AwsAppConfigProvider
Obtiene configuración desde AWS AppConfig.

## Instalación

```bash
npm install @vs-tkn/runtime-config
```

## Uso básico

```typescript
import { ConfigClient, InMemoryProvider } from '@vs-tkn/runtime-config';

const provider = new InMemoryProvider({
  featureXEnabled: true,
  timeoutMs: 5000,
});

const config = new ConfigClient(provider);

const enabled = await config.get<boolean>('featureXEnabled');
```

## Uso con AWS AppConfig

```typescript
import {
  ConfigClient,
  AwsAppConfigProvider,
} from '@vs-tkn/runtime-config';

const provider = new AwsAppConfigProvider({
  application: 'my-app',
  environment: 'prod',
  profile: 'default',
  region: 'us-east-1',
});

const config = new ConfigClient(provider);

const value = await config.get<string>('apiUrl');
```

## API principal

### `ConfigClient`

```typescript
get<T>(key: string): Promise<T | undefined>
```

* Retorna el valor tipado
* No lanza error si la key no existe

### `ConfigProvider`

Interface base para implementar nuevos providers.

```typescript
get(key: string): Promise<unknown>
```

## Casos de uso típicos

* Feature flags
* URLs y endpoints
* Timeouts y límites
* Configuración por entorno
* Switches operativos

## Extensibilidad

Se pueden agregar nuevos providers (DB, HTTP, Vault, etc.) implementando `ConfigProvider`.

## No es

* Un secret manager
* Un reemplazo de IAM
* Un sistema de templates

## Licencia

MIT