import { ConfigProvider } from './ConfigProvider';
/**
 * 🔥DG
 * AwsSecretsProvider
 *
 * Provider para leer secrets específicos desde AWS SecretsManager.
 *
 * Responsabilidad ÚNICA:
 * - Obtener secretos desde AWS SecretsManager
 *
 * NO hace:
 * - cache (eso lo hace ConfigClient)
 * - polling
 * - validación
 */
export declare class AwsSecretsProvider implements ConfigProvider {
    private client;
    /**
     * Lista de secrets a cachear
     */
    private readonly secretNames;
    constructor(params: {
        region: string;
        secretNames: string[];
        accessKeyId?: string;
        secretAccessKey?: string;
    });
    /**
     * Carga los secrets desde AWS y devuelve un objeto con key = nombre del secret
     */
    load(): Promise<Record<string, any>>;
}
