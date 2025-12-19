import { ConfigProvider } from './ConfigProvider';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

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
export class AwsSecretsProvider implements ConfigProvider {
  private client: SecretsManagerClient;

  /**
   * Lista de secrets a cachear
   */
  private readonly secretNames: string[];

  constructor(params: {
    region: string;
    secretNames: string[];
    accessKeyId?: string;
    secretAccessKey?: string;
  }) {
    this.client = new SecretsManagerClient({
      region: params.region,
      credentials:
        params.accessKeyId && params.secretAccessKey
          ? {
            accessKeyId: params.accessKeyId,
            secretAccessKey: params.secretAccessKey,
          }
          : undefined, // usa IAM role si no hay keys
    });

    this.secretNames = params.secretNames;
  }

  /**
   * Carga los secrets desde AWS y devuelve un objeto con key = nombre del secret
   */
  async load(): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    for (const name of this.secretNames) {
      try {
        const command = new GetSecretValueCommand({ SecretId: name });
        const response = await this.client.send(command);

        if (response.SecretString) {
          try {
            // Si es JSON, parseamos
            result[name] = JSON.parse(response.SecretString);
          } catch {
            // Si no es JSON, lo guardamos tal cual
            result[name] = response.SecretString;
          }
        }
      } catch (err) {
        // No interrumpe la carga de otros secrets
        console.warn(`No se pudo cargar secret ${name}:`, err);
      }
    }

    return result;
  }
}
