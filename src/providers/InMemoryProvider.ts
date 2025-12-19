/**
 * 🔥DG 
 * InMemoryProvider
 *
 * Provider SIMPLE en memoria.
 *
 * Usos típicos:
 * - tests
 * - desarrollo local
 * - fallback controlado
 *
 * NO usar en producción como fuente real de config.
 */

import { ConfigProvider } from './ConfigProvider';

export class InMemoryProvider implements ConfigProvider {
  /**
   * Configuración fija en memoria.
   * Se pasa por constructor.
   */
  constructor(
    private readonly data: Record<string, any>,
  ) {}

  /**
   * Devuelve SIEMPRE la misma configuración.
   * No falla, no muta, no hace I/O.
   */
  async load(): Promise<Record<string, any>> {
    return this.data;
  }
}
