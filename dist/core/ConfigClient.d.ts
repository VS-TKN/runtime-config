import { RuntimeConfigOptions } from './ConfigTypes';
import { ConfigProvider } from '../providers/ConfigProvider';
/**
 * 🔥DG
 * ConfigClient
 *
 * Esta clase:
 * - vive UNA vez por microservicio
 * - mantiene la config en memoria
 * - delega la carga a un ConfigProvider
 *
 * Nunca debe instanciarse por request.
 */
export declare class ConfigClient {
    /**
     * Provider concreto (AWS, memoria, etc).
     * El cliente NO sabe qué implementación es.
     */
    private readonly provider;
    /**
     * Opciones de comportamiento del cliente.
     */
    private readonly options?;
    /**
     * Cache en memoria de la configuración actual.
     * Vive mientras el proceso esté vivo.
     */
    private cache;
    /**
     * Indica si el cliente ya fue inicializado.
     * Evita usos prematuros.
     */
    private initialized;
    /**
     * Referencia al timer de polling (si existe).
     */
    private refreshTimer?;
    constructor(
    /**
     * Provider concreto (AWS, memoria, etc).
     * El cliente NO sabe qué implementación es.
     */
    provider: ConfigProvider, 
    /**
     * Opciones de comportamiento del cliente.
     */
    options?: RuntimeConfigOptions | undefined);
    /**
     * Inicializa el cliente.
     *
     * - Carga la config inicial
     * - Arranca polling si está configurado
     *
     * Debe llamarse UNA sola vez al boot del mic.
     */
    init(): Promise<void>;
    /**
     * Obtiene un valor de configuración por key.
     *
     * IMPORTANTE:
     * - NO es async
     * - Siempre lee de cache
     *
     * Si la key no existe, devuelve undefined.
     */
    get<T = any>(key: string): T;
    /**
     * Fuerza la recarga completa de la configuración.
     *
     * - Llama al provider
     * - Si falla, NO limpia la cache
     * - Si tiene éxito, reemplaza la cache completa
     */
    reload(): Promise<void>;
    /**
     * Detiene el polling si existía.
     * Útil para tests o shutdown ordenado.
     */
    stop(): void;
}
