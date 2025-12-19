import { RuntimeConfigData, RuntimeConfigOptions } from './ConfigTypes';
import { ConfigProvider } from '../providers/ConfigProvider';

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
export class ConfigClient {
  /**
   * Cache en memoria de la configuración actual.
   * Vive mientras el proceso esté vivo.
   */
  private cache: RuntimeConfigData = {};

  /**
   * Indica si el cliente ya fue inicializado.
   * Evita usos prematuros.
   */
  private initialized = false;

  /**
   * Referencia al timer de polling (si existe).
   */
  private refreshTimer?: NodeJS.Timeout;

  constructor(
    /**
     * Provider concreto (AWS, memoria, etc).
     * El cliente NO sabe qué implementación es.
     */
    private readonly provider: ConfigProvider,

    /**
     * Opciones de comportamiento del cliente.
     */
    private readonly options?: RuntimeConfigOptions,
  ) { }

  /**
   * Inicializa el cliente.
   *
   * - Carga la config inicial
   * - Arranca polling si está configurado
   *
   * Debe llamarse UNA sola vez al boot del mic.
   */
  async init(): Promise<void> {
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
  get<T = any>(key: string, option?: { force: boolean }): T {
    if (!this.initialized) {
      throw new Error(
        'ConfigClient not initialized. Call init() before using get().',
      );
    }
    if (option && option.force) {
      this.reload()
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
  async reload(): Promise<void> {
    try {
      const data = await this.provider.load();

      // Reemplazo atómico de la cache
      this.cache = data;

      // Callback opcional post-reload
      this.options?.onReload?.();
    } catch (error) {
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
  stop(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
}
