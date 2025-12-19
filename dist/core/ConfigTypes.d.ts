/**
 * 🔥DG
 * Representa el objeto completo de configuración en runtime.
 *
 * Es intencionalmente genérico:
 * - la librería NO sabe qué keys existen
 * - NO valida schema
 * - solo transporta datos
 *
 * Cada microservicio decide qué keys usar.
 */
export type RuntimeConfigData = Record<string, any>;
/**
 * Opciones de comportamiento del ConfigClient.
 *
 * - refreshIntervalMs:
 *   Intervalo de polling para refrescar la config.
 *   Si no se setea, NO hay polling automático.
 *
 * - onReload:
 *   Callback que se ejecuta cada vez que
 *   la config se recarga correctamente.
 *   Se usa típicamente para:
 *     - recrear pools
 *     - reinitializar clientes
 */
export interface RuntimeConfigOptions {
    refreshIntervalMs?: number;
    onReload?: () => void;
}
