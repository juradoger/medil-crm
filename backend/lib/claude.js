// Cliente de Claude (Anthropic) — singleton perezoso
// Claude (Anthropic) client — lazy singleton
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { CLAUDE_MODEL, AI_MAX_TOKENS } from '../core/constants.js';
dotenv.config();

let client = null;

// Devuelve el cliente de Claude; lanza error claro si falta la API key
export function getClaudeClient() {
  if (!process.env.CLAUDE_API_KEY) {
    throw new Error(
      'CLAUDE_API_KEY no configurada. ' +
      'Agregala al backend/.env para usar la IA.'
    );
  }
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }
  return client;
}

// Función base para llamar a Claude — Base helper to call Claude
export async function askClaude(systemPrompt, userMessage, maxTokens = AI_MAX_TOKENS) {
  const claude = getClaudeClient();
  const message = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: userMessage }],
    system: systemPrompt,
  });
  return message.content[0].text;
}
