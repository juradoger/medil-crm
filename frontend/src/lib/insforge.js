// Cliente InsForge centralizado — Centralized InsForge client
// Única instancia compartida por todos los servicios — Single instance shared by all services
import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_API_URL,
  anonKey: import.meta.env.VITE_INSFORGE_API_KEY,
});

export const db = client.database;
