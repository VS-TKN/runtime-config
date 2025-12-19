"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsSecretsProvider = void 0;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
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
class AwsSecretsProvider {
    constructor(params) {
        this.client = new client_secrets_manager_1.SecretsManagerClient({
            region: params.region,
            credentials: {
                accessKeyId: params.accessKeyId,
                secretAccessKey: params.secretAccessKey,
            },
        });
        this.secretNames = params.secretNames;
    }
    /**
     * Carga los secrets desde AWS y devuelve un objeto con key = nombre del secret
     */
    async load() {
        const result = {};
        for (const name of this.secretNames) {
            try {
                const command = new client_secrets_manager_1.GetSecretValueCommand({ SecretId: name });
                const response = await this.client.send(command);
                if (response.SecretString) {
                    try {
                        // Si es JSON, parseamos
                        result[name] = JSON.parse(response.SecretString);
                    }
                    catch {
                        // Si no es JSON, lo guardamos tal cual
                        result[name] = response.SecretString;
                    }
                }
            }
            catch (err) {
                // No interrumpe la carga de otros secrets
                console.warn(`No se pudo cargar secret ${name}:`, err);
            }
        }
        return result;
    }
}
exports.AwsSecretsProvider = AwsSecretsProvider;
