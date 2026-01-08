import { ConfigProvider } from './ConfigProvider';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import {
  ECSClient,
  DescribeTaskDefinitionCommand,
} from '@aws-sdk/client-ecs';

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
export class AwsSecretsProvider implements ConfigProvider {
  /** Cliente de AWS Secrets Manager */
  private secretsClient: SecretsManagerClient;

  /** Cliente de AWS ECS */
  private ecsClient: ECSClient;

  /** Nombres de las variables a resolver */
  private readonly variableNames: string[];

  /** Nombre o ARN de la Task Definition (opcional, se resuelve vía metadata) */
  private readonly taskDefinition?: string;

  /** Nombre del contenedor dentro de la Task Definition */
  private readonly containerName: string;

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
  }) {
    const credentials =
      params.accessKeyId && params.secretAccessKey
        ? {
            accessKeyId: params.accessKeyId,
            secretAccessKey: params.secretAccessKey,
          }
        : undefined;

    this.secretsClient = new SecretsManagerClient({
      region: params.region,
      credentials,
    });

    this.ecsClient = new ECSClient({
      region: params.region,
      credentials,
    });

    this.taskDefinition = params.taskDefinition;
    this.variableNames = params.variableNames;
    this.containerName = params.containerName;
  }

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
  async load(): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    try {
      // Resolver dinámicamente la Task Definition
      const taskDefinition = await this.resolveTaskDefinition();

      // Consultar la Task Definition en ECS
      const command = new DescribeTaskDefinitionCommand({
        taskDefinition,
      });
      const response = await this.ecsClient.send(command);

      if (!response.taskDefinition?.containerDefinitions) {
        throw new Error('No se encontraron definiciones de contenedores');
      }

      // Buscar el contenedor objetivo
      const container = response.taskDefinition.containerDefinitions.find(
        (c) => c.name === this.containerName
      );

      if (!container) {
        throw new Error(
          `No se encontró el contenedor ${this.containerName}`
        );
      }

      // Resolver cada variable solicitada
      for (const varName of this.variableNames) {
        // 1. Variables definidas directamente en environment
        const envVar = container.environment?.find(
          (e) => e.name === varName
        );
        if (envVar?.value !== undefined) {
          result[varName] = envVar.value;
          continue;
        }

        // 2. Variables definidas como secrets
        const secretVar = container.secrets?.find(
          (s) => s.name === varName
        );
        if (secretVar?.valueFrom) {
          result[varName] = await this.resolveSecret(secretVar.valueFrom);
          continue;
        }
      }
    } catch (err) {
      console.error('Error obteniendo task definition:', err);
      throw err;
    }

    return result;
  }

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
  private async resolveTaskDefinition(): Promise<string> {
    if (this.taskDefinition) {
      return this.taskDefinition;
    }

    const uri = process.env.ECS_CONTAINER_METADATA_URI_V4;
    if (!uri) {
      throw new Error(
        'taskDefinition no especificada y ECS metadata no disponible'
      );
    }

    const res = await fetch(`${uri}/task`);
    const data = await res.json();

    return data.TaskDefinitionFamily;
  }

  /**
   * Obtiene el valor de un secret desde AWS Secrets Manager.
   *
   * Si el secret contiene un JSON, se parsea automáticamente.
   *
   * @param secretId ARN o nombre del secret
   * @returns Valor del secret (string o JSON)
   * @throws Error si el secret no existe o no tiene SecretString
   */
  private async resolveSecret(secretId: string): Promise<any> {
    const command = new GetSecretValueCommand({ SecretId: secretId });
    const response = await this.secretsClient.send(command);

    if (response.SecretString) {
      try {
        return JSON.parse(response.SecretString);
      } catch {
        return response.SecretString;
      }
    }

    throw new Error(`Secret ${secretId} no tiene SecretString`);
  }
}
