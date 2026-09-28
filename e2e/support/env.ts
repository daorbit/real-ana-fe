import { existsSync } from "node:fs";
import path from "node:path";

const envFile = path.join(import.meta.dirname, "..", ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

export const FE_PORT = 5174;
export const BE_PORT = 4100;

export const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${FE_PORT}`;
export const API_URL = process.env.E2E_API_URL || `http://localhost:${BE_PORT}`;

export const BACKEND_DIR = path.resolve(import.meta.dirname, "..", "..", "..", "real-ana-be");

export const TOKEN_KEY = "rta_token";
export const USER_PREFIX = "e2e-onb";
export const USER_DOMAIN = "e2e.quantalog.test";
