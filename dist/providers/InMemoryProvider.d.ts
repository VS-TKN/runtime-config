/**
 * 🔥DG
 * InMemoryProvider
 *
 * Provider SIMPLE en memoria.
 *
 * Usos típicos:
 * - tests
 * - desarrollo local
 * - fallback controlado
 *
 * NO usar en producción como fuente real de config.
 */
import { ConfigProvider } from './ConfigProvider';
export declare class InMemoryProvider implements ConfigProvider {
    private readonly data;
    /**
     * Configuración fija en memoria.
     * Se pasa por constructor.
     */
    constructor(data: Record<string, any>);
    /**
     * Devuelve SIEMPRE la misma configuración.
     * No falla, no muta, no hace I/O.
     */
    load(): Promise<Record<string, any>>;
}
