import { OpenRouterRequest } from "~/types/chat.type";
import { config } from "../utils/config";
import OpenAI from "openai";

export async function sendChatMessage(request: OpenRouterRequest) {
  const openai = new OpenAI({
    baseURL: config.LLM_URL,
    apiKey: config.LLM_KEY,
  });
  return await openai.chat.completions.create({
    model: config.LLM_MODEL,
    ...request,
  });
}
