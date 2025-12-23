import { ConfigProvider } from './ConfigProvider';

/**
 * 🔥DG
 * ProcessEnvProvider
 *
 * Provider que lee directamente desde process.env
 *
 * Requisito:
 * - Las variables ya deben estar en process.env
 *   (por ejemplo, cargadas con dotenv en el main)
 *
 * Usos típicos:
 * - Desarrollo local (después de dotenv.config())
 * - Testing con variables mockeadas
 */
export class ProcessEnvProvider implements ConfigProvider {
  /**
   * Nombres de las variables que queremos obtener
   */
  private readonly variableNames: string[];

  constructor(params: {
    variableNames: string[];
  }) {
    this.variableNames = params.variableNames;
  }

  /**
   * Lee las variables desde process.env
   */
  async load(): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    for (const varName of this.variableNames) {
      const value = process.env[varName];
      
      if (value !== undefined) {
        // Intentar parsear como JSON si es posible
        try {
          result[varName] = JSON.parse(value);
        } catch {
          // Si no es JSON, guardar como string
          result[varName] = value;
        }
      } else {
        console.warn(`Variable ${varName} no encontrada en process.env`);
      }
    }

    return result;
  }
}