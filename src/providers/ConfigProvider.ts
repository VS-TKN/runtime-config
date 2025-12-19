/**
 * 🔥DG 
 * ConfigProvider
 *
 * Contrato que deben cumplir TODAS las implementaciones
 * de providers de configuración.
 *
 * IMPORTANTE:
 * - El provider NO mantiene cache.
 * - El provider NO hace polling.
 * - El provider SOLO sabe cómo obtener la config desde
 *   una fuente concreta (AWS, memoria, archivo, etc).
 *
 * El ConfigClient es el único responsable del cache
 * y del ciclo de vida.
 */
export interface ConfigProvider {
  /**
   * Carga la configuración completa desde la fuente.
   *
   * Reglas:
   * - Debe devolver TODA la configuración como un objeto.
   * - Si falla, debe lanzar error.
   * - No debe devolver parciales.
   *
   * El ConfigClient decide qué hacer ante un error.
   */
  load(): Promise<Record<string, any>>;
}
