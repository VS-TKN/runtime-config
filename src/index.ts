/**
 * 🔥DG 
 * Punto de entrada público de la librería.
 *
 * TODO lo que se exporta acá es lo que
 * los microservicios pueden importar.
 *
 * Nada fuera de este archivo debería
 * importarse directamente.
 */

// Core
export { ConfigClient } from './core/ConfigClient';
export type {
  RuntimeConfigData,
  RuntimeConfigOptions,
} from './core/ConfigTypes';

// Providers
export { AwsSecretsProvider } from './providers/AwsSecretsProvider';
export { ProcessEnvProvider } from './providers/InMemoryProvider';
export type { ConfigProvider } from './providers/ConfigProvider';
