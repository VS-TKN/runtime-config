"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigClient = void 0;
/**
 * 🔥DG
 * ConfigClient
 *
 * Esta clase:
 * - vive UNA vez por microservicio
 * - mantiene la config en memoria
 * - delega la carga a un ConfigProvider
 *
 * Nunca debe instanciarse por request.
 */
class ConfigClient {
    constructor(
    /**
     * Provider concreto (AWS, memoria, etc).
     * El cliente NO sabe qué implementación es.
     */
    provider, 
    /**
     * Opciones de comportamiento del cliente.
     */
    options) {
        this.provider = provider;
        this.options = options;
        /**
         * Cache en memoria de la configuración actual.
         * Vive mientras el proceso esté vivo.
         */
        this.cache = {};
        /**
         * Indica si el cliente ya fue inicializado.
         * Evita usos prematuros.
         */
        this.initialized = false;
    }
    /**
     * Inicializa el cliente.
     *
     * - Carga la config inicial
     * - Arranca polling si está configurado
     *
     * Debe llamarse UNA sola vez al boot del mic.
     */
    async init() {
        if (this.initialized) {
            return;
        }
        // Carga inicial (obligatoria)
        await this.reload();
        this.initialized = true;
        // Si se configuró polling, lo activamos
        if (this.options?.refreshIntervalMs) {
            this.refreshTimer = setInterval(() => {
                this.reload().catch(() => {
                    // IMPORTANTE:
                    // - nunca lanzamos error acá
                    // - si falla, seguimos usando la cache actual
                });
            }, this.options.refreshIntervalMs);
        }
    }
    /**
     * Obtiene un valor de configuración por key.
     *
     * IMPORTANTE:
     * - NO es async
     * - Siempre lee de cache
     *
     * Si la key no existe, devuelve undefined.
     */
    get(key, option) {
        if (!this.initialized) {
            throw new Error('ConfigClient not initialized. Call init() before using get().');
        }
        if (option && option.force) {
            this.reload();
        }
        return this.cache[key];
    }
    /**
     * Fuerza la recarga completa de la configuración.
     *
     * - Llama al provider
     * - Si falla, NO limpia la cache
     * - Si tiene éxito, reemplaza la cache completa
     */
    async reload() {
        try {
            const data = await this.provider.load();
            // Reemplazo atómico de la cache
            this.cache = data;
            // Callback opcional post-reload
            this.options?.onReload?.();
        }
        catch (error) {
            // MUY importante:
            // - no propagamos el error
            // - no rompemos el mic
            // - seguimos con la última config válida
        }
    }
    /**
     * Detiene el polling si existía.
     * Útil para tests o shutdown ordenado.
     */
    stop() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
    }
}
exports.ConfigClient = ConfigClient;
