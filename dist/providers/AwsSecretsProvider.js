"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsSecretsProvider = void 0;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const client_ecs_1 = require("@aws-sdk/client-ecs");
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
class AwsSecretsProvider {
    constructor(params) {
        const credentials = params.accessKeyId && params.secretAccessKey
            ? {
                accessKeyId: params.accessKeyId,
                secretAccessKey: params.secretAccessKey,
            }
            : undefined;
        this.secretsClient = new client_secrets_manager_1.SecretsManagerClient({
            region: params.region,
            credentials,
        });
        this.ecsClient = new client_ecs_1.ECSClient({
            region: params.region,
            credentials,
        });
        this.taskDefinition = params.taskDefinition;
        this.variableNames = params.variableNames;
        this.containerName = params.containerName;
    }
    /**
     * 1. Consulta la Task Definition en ECS
     * 2. Extrae las variables solicitadas
     * 3. Resuelve secrets si es necesario
     */
    async load() {
        const result = {};
        try {
            // 1. Obtener la Task Definition
            const command = new client_ecs_1.DescribeTaskDefinitionCommand({
                taskDefinition: this.taskDefinition,
            });
            const response = await this.ecsClient.send(command);
            if (!response.taskDefinition?.containerDefinitions) {
                throw new Error('No se encontraron definiciones de contenedores');
            }
            // 2. Obtener el contenedor correcto
            const container = this.containerName
                ? response.taskDefinition.containerDefinitions.find((c) => c.name === this.containerName)
                : response.taskDefinition.containerDefinitions[0];
            if (!container) {
                throw new Error(`No se encontró el contenedor ${this.containerName || '(primero)'}`);
            }
            // 3. Procesar cada variable solicitada
            for (const varName of this.variableNames) {
                try {
                    // Buscar en 'environment' (valores directos)
                    const envVar = container.environment?.find((e) => e.name === varName);
                    if (envVar?.value !== undefined) {
                        result[varName] = envVar.value;
                        continue;
                    }
                    // Buscar en 'secrets' (secrets de AWS)
                    const secretVar = container.secrets?.find((s) => s.name === varName);
                    if (secretVar?.valueFrom) {
                        const secretValue = await this.resolveSecret(secretVar.valueFrom);
                        result[varName] = secretValue;
                        continue;
                    }
                    console.warn(`Variable ${varName} no encontrada en la task definition`);
                }
                catch (err) {
                    console.warn(`Error procesando variable ${varName}:`, err);
                }
            }
        }
        catch (err) {
            console.error('Error obteniendo task definition:', err);
            throw err;
        }
        return result;
    }
    /**
     * Resuelve un secret desde AWS SecretsManager
     */
    async resolveSecret(secretId) {
        const command = new client_secrets_manager_1.GetSecretValueCommand({ SecretId: secretId });
        const response = await this.secretsClient.send(command);
        if (response.SecretString) {
            try {
                return JSON.parse(response.SecretString);
            }
            catch {
                return response.SecretString;
            }
        }
        throw new Error(`Secret ${secretId} no tiene SecretString`);
    }
}
exports.AwsSecretsProvider = AwsSecretsProvider;
