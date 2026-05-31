// Cliente InsForge centralizado — Centralized InsForge client
// Única instancia compartida por todos los servicios — Single instance shared by all services
//
// Sintaxis real confirmada en el código (verificada contra @insforge/sdk,
// que expone un PostgrestQueryBuilder estilo Supabase/PostgREST y devuelve { data, error }):
//   db.from('tabla').select('*')                          → obtener todos
//   db.from('tabla').select('*').eq('campo', valor)       → filtrar por igualdad
//   db.from('tabla').insert(data).select()                → insertar (devuelve filas creadas)
//   db.from('tabla').update(data).eq('campo', valor)      → actualizar por filtro
//   db.from('tabla').select('*').eq('id', id).single()    → exactamente una fila (error si 0 o >1)
//   db.from('tabla').select('*').eq('id', id).maybeSingle()→ una fila o null si no existe
// Toda llamada resuelve a un objeto { data, error }: SIEMPRE desestructurar y
// lanzar new Error(error.message) cuando error no es null.
// NO existe db.collection().where().find() (sintaxis antigua eliminada de la doc).
import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_API_URL,
  anonKey: import.meta.env.VITE_INSFORGE_API_KEY,
});

export const db = client.database;
