import { ConfigProvider } from './ConfigProvider';
/**
 * AwsSecretsProvider
 *
 * Provider de configuración para aplicaciones que corren en ECS.
 *
 * Responsabilidad:
 * - Obtener variables de configuración definidas en una Task Definition
 * - Resolver valores desde AWS Secrets Manager cuando corresponde
 *
 * El provider:
 * - Detecta automáticamente la Task Definition cuando corre en ECS
 * - Soporta múltiples contenedores (requiere containerName)
 * - No maneja cache ni refresh (responsabilidad del ConfigClient)
 */
export declare class AwsSecretsProvider implements ConfigProvider {
    /** Cliente de AWS Secrets Manager */
    private secretsClient;
    /** Cliente de AWS ECS */
    private ecsClient;
    /** Nombres de las variables a resolver */
    private readonly variableNames;
    /** Nombre o ARN de la Task Definition (opcional, se resuelve vía metadata) */
    private readonly taskDefinition?;
    /** Nombre del contenedor dentro de la Task Definition */
    private readonly containerName;
    /**
     * Constructor del provider
     *
     * @param params.region Región AWS donde corre ECS / Secrets Manager
     * @param params.taskDefinition Nombre o ARN de la Task Definition (opcional)
     * @param params.variableNames Lista de variables que se desean obtener
     * @param params.containerName Nombre del contenedor objetivo
     * @param params.accessKeyId Credenciales explícitas (opcional)
     * @param params.secretAccessKey Credenciales explícitas (opcional)
     */
    constructor(params: {
        region: string;
        taskDefinition?: string;
        variableNames: string[];
        containerName: string;
        accessKeyId?: string;
        secretAccessKey?: string;
    });
    /**
     * Carga la configuración desde ECS.
     *
     * Flujo:
     * 1. Resuelve la Task Definition (parámetro o metadata de ECS)
     * 2. Obtiene la definición completa desde ECS
     * 3. Selecciona el contenedor configurado
     * 4. Extrae variables de entorno y secrets solicitados
     *
     * @returns Objeto con las variables resueltas
     * @throws Error si no se puede acceder a ECS o al contenedor
     */
    load(): Promise<Record<string, any>>;
    /**
     * Resuelve el nombre de la Task Definition a utilizar.
     *
     * Prioridad:
     * 1. Task Definition pasada por parámetro al constructor
     * 2. Metadata de ECS (ECS_CONTAINER_METADATA_URI_V4)
     *
     * @returns Nombre de la Task Definition (family)
     * @throws Error si no puede resolverse
     */
    private resolveTaskDefinition;
    /**
     * Obtiene el valor de un secret desde AWS Secrets Manager.
     *
     * Si el secret contiene un JSON, se parsea automáticamente.
     *
     * @param secretId ARN o nombre del secret
     * @returns Valor del secret (string o JSON)
     * @throws Error si el secret no existe o no tiene SecretString
     */
    private resolveSecret;
}
