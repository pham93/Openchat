// src/utils/env.ts
import dotenvFlow from "dotenv-flow";

// Load environment variables from all .env files
dotenvFlow.config();

// Access environment variables
export const config = Object.freeze({
  SERVER_URL: process.env.SERVER_URL || 5124,
  LLM_KEY: process.env.LLM_KEY,
  LLM_URL: process.env.LLM_URL,
  LLM_MODEL: process.env.LLM_MODEL ?? "",
  SPEECH_API: process.env.SPEECH_API ?? "",
  AZURE_REGION: process.env.AZURE_REGION ?? "",
});

export const OPEN_ROUTER_CONFIG = {};
