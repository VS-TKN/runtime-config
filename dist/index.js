"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryProvider = exports.AwsAppConfigProvider = exports.ConfigClient = void 0;
// Core
var ConfigClient_1 = require("./core/ConfigClient");
Object.defineProperty(exports, "ConfigClient", { enumerable: true, get: function () { return ConfigClient_1.ConfigClient; } });
// Providers
var AwsAppConfigProvider_1 = require("./providers/AwsAppConfigProvider");
Object.defineProperty(exports, "AwsAppConfigProvider", { enumerable: true, get: function () { return AwsAppConfigProvider_1.AwsAppConfigProvider; } });
var InMemoryProvider_1 = require("./providers/InMemoryProvider");
Object.defineProperty(exports, "InMemoryProvider", { enumerable: true, get: function () { return InMemoryProvider_1.InMemoryProvider; } });
