// Cliente de Groq (OpenAI-compatible) — singleton perezoso
// Groq client (OpenAI-compatible) — lazy singleton
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { AI_MODEL, AI_MAX_TOKENS } from '../core/constants.js';
dotenv.config();

let client = null;

// Devuelve el cliente de Groq; lanza error claro si falta la API key
export function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      'GROQ_API_KEY no configurada. ' +
      'Obtené una gratis en console.groq.com'
    );
  }
  if (!client) {
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return client;
}

// Función base para llamar a Groq — Base helper to call Groq
export async function askGroq(systemPrompt, userMessage, maxTokens = AI_MAX_TOKENS) {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });
  return completion.choices[0]?.message?.content || '';
}
