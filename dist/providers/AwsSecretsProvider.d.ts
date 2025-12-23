import { ConfigProvider } from './ConfigProvider';
/**
 * 🔥DG
 * AwsSecretsProvider
 *
 * Provider que obtiene variables de entorno desde una Task Definition de ECS.
 * Automáticamente resuelve secrets si la variable los tiene configurados.
 *
 * Responsabilidad ÚNICA:
 * - Leer variables de una Task Definition
 * - Resolver secrets cuando sea necesario
 *
 * NO hace:
 * - cache (eso lo hace ConfigClient)
 * - polling
 * - validación
 */
export declare class AwsSecretsProvider implements ConfigProvider {
    private secretsClient;
    private ecsClient;
    /**
     * Nombres de las variables que queremos obtener
     */
    private readonly variableNames;
    /**
     * ARN o nombre de la Task Definition (ej: "mi-app:5" o "mi-app")
     */
    private readonly taskDefinition;
    /**
     * Nombre del contenedor dentro de la task definition (opcional si solo hay uno)
     */
    private readonly containerName?;
    constructor(params: {
        region: string;
        taskDefinition: string;
        variableNames: string[];
        containerName?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
    });
    /**
     * 1. Consulta la Task Definition en ECS
     * 2. Extrae las variables solicitadas
     * 3. Resuelve secrets si es necesario
     */
    load(): Promise<Record<string, any>>;
    /**
     * Resuelve un secret desde AWS SecretsManager
     */
    private resolveSecret;
}
