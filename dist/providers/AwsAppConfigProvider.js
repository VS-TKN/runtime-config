"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsAppConfigProvider = void 0;
const client_appconfigdata_1 = require("@aws-sdk/client-appconfigdata");
class AwsAppConfigProvider {
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
    params) {
        this.params = params;
        this.client = new client_appconfigdata_1.AppConfigDataClient({
            region: params.awsRegion,
        });
    }
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
    async load() {
        // 1️⃣ Si no tenemos sesión, la iniciamos
        if (!this.configurationToken) {
            const sessionResponse = await this.client.send(new client_appconfigdata_1.StartConfigurationSessionCommand({
                ApplicationIdentifier: this.params.applicationId,
                EnvironmentIdentifier: this.params.environmentId,
                ConfigurationProfileIdentifier: this.params.configurationProfileId,
            }));
            this.configurationToken =
                sessionResponse.InitialConfigurationToken;
        }
        // 2️⃣ Pedimos la última configuración disponible
        const configResponse = await this.client.send(new client_appconfigdata_1.GetLatestConfigurationCommand({
            ConfigurationToken: this.configurationToken,
        }));
        // 3️⃣ Guardamos el token para el próximo polling
        this.configurationToken =
            configResponse.NextPollConfigurationToken;
        // 4️⃣ Si AWS no envía configuración, no hubo cambios
        if (!configResponse.Configuration?.length) {
            // IMPORTANTE:
            // devolvemos objeto vacío
            // el ConfigClient decidirá si reemplaza o no
            return {};
        }
        // 5️⃣ Convertimos el payload binario a string
        const rawConfig = Buffer.from(configResponse.Configuration).toString('utf-8');
        // 6️⃣ Parseamos JSON
        // Asumimos que AppConfig entrega JSON válido
        return JSON.parse(rawConfig);
    }
}
exports.AwsAppConfigProvider = AwsAppConfigProvider;
