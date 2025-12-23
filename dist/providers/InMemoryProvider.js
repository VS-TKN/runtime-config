"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessEnvProvider = void 0;
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
class ProcessEnvProvider {
    constructor(params) {
        this.variableNames = params.variableNames;
    }
    /**
     * Lee las variables desde process.env
     */
    async load() {
        const result = {};
        for (const varName of this.variableNames) {
            const value = process.env[varName];
            if (value !== undefined) {
                // Intentar parsear como JSON si es posible
                try {
                    result[varName] = JSON.parse(value);
                }
                catch {
                    // Si no es JSON, guardar como string
                    result[varName] = value;
                }
            }
            else {
                console.warn(`Variable ${varName} no encontrada en process.env`);
            }
        }
        return result;
    }
}
exports.ProcessEnvProvider = ProcessEnvProvider;
