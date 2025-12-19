/**
 * 🔥DG
 * AwsAppConfigProvider
 *
 * Implementación ESPECÍFICA de AWS AppConfig.
 *
 * Responsabilidad ÚNICA:
 * - Obtener la configuración desde AWS AppConfig
 *
 * NO hace:
 * - cache
 * - polling
 * - validación
 * - lógica de negocio
 *
 * Todo eso es responsabilidad del ConfigClient.
 */
import { ConfigProvider } from './ConfigProvider';
export declare class AwsAppConfigProvider implements ConfigProvider {
    /**
     * Identificadores de AppConfig.
     *
     * Estos valores definen:
     * - QUÉ aplicación
     * - EN QUÉ ambiente
     * - QUÉ perfil de configuración
     *
     * Cada microservicio define los suyos.
     */
    private readonly params;
    /**
     * Cliente oficial AWS SDK v3 para AppConfigData.
     * Usa credenciales/IAM del entorno (ECS, EC2, etc).
     */
    private readonly client;
    /**
     * Token interno que AWS usa para:
     * - saber qué versión tenés
     * - devolver solo cambios (delta)
     *
     * Este token es STATELESS para la app,
     * pero STATEFUL para AWS.
     */
    private configurationToken?;
    constructor(
    /**
     * Identificadores de AppConfig.
     *
     * Estos valores definen:
     * - QUÉ aplicación
     * - EN QUÉ ambiente
     * - QUÉ perfil de configuración
     *
     * Cada microservicio define los suyos.
     */
    params: {
        applicationId: string;
        environmentId: string;
        configurationProfileId: string;
        awsRegion?: string;
    });
    /**
     * Carga la configuración completa desde AWS AppConfig.
     *
     * Flujo REAL de AppConfig:
     * 1. Si no hay sesión, se inicia una
     * 2. Se pide la última configuración
     * 3. AWS decide si hay cambios o no
     *
     * Si no hay cambios:
     * - AWS devuelve payload vacío
     * - El ConfigClient mantiene la cache previa
     */
    load(): Promise<Record<string, any>>;
}
