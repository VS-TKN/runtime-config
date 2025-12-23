import { ConfigProvider } from './ConfigProvider';
/**
 * 🔥DG
 * ProcessEnvProvider
 *
 * Provider que lee directamente desde process.env
 *
 * Requisito:
 * - Las variables ya deben estar en process.env
 *   (por ejemplo, cargadas con dotenv en el main)
 *
 * Usos típicos:
 * - Desarrollo local (después de dotenv.config())
 * - Testing con variables mockeadas
 */
export declare class LocalProvider implements ConfigProvider {
    /**
     * Nombres de las variables que queremos obtener
     */
    private readonly variableNames;
    constructor(params: {
        variableNames: string[];
    });
    /**
     * Lee las variables desde process.env
     */
    load(): Promise<Record<string, any>>;
}
