import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: process.env.INSFORGE_API_URL,
  anonKey: process.env.INSFORGE_API_KEY,
});

export const db = client.database;
