// Adaptador de compatibilidad: la IA ahora usa Groq, manteniendo la interfaz previa
// Compatibility shim: AI now uses Groq while keeping the previous interface
import { askGroq, getGroqClient } from './groq.js';

// Mantiene la misma interfaz para no cambiar routes/ai.js
export const askClaude = askGroq;
export const getClaudeClient = getGroqClient;
