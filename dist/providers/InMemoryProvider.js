"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryProvider = void 0;
class InMemoryProvider {
    /**
     * Configuración fija en memoria.
     * Se pasa por constructor.
     */
    constructor(data) {
        this.data = data;
    }
    /**
     * Devuelve SIEMPRE la misma configuración.
     * No falla, no muta, no hace I/O.
     */
    async load() {
        return this.data;
    }
}
exports.InMemoryProvider = InMemoryProvider;
