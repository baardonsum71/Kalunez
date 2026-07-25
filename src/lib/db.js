import { supabase } from '@/api/supabaseClient';

/**
 * Thin data-access helpers that mirror the shape of the old Base44
 * `entities.X.list/filter/create/update/delete/subscribe` API, so page
 * components needed minimal changes during the Supabase migration.
 *
 * `sort` uses the same convention as Base44: a field name, optionally
 * prefixed with `-` for descending order (e.g. '-created_date').
 */

function applySort(query, sort) {
  if (!sort) return query;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  // created_date/updated_date were Base44 field names; our tables use created_at/updated_at.
  const column = field === 'created_date' ? 'created_at' : field === 'updated_date' ? 'updated_at' : field;
  return query.order(column, { ascending: !desc });
}

// Adds created_date/updated_date aliases so existing render code that reads
// Base44-style field names keeps working without touching every component.
function withDateAliases(row) {
  if (!row || typeof row !== 'object') return row;
  return {
    ...row,
    ...(row.created_at !== undefined ? { created_date: row.created_at } : {}),
    ...(row.updated_at !== undefined ? { updated_date: row.updated_at } : {}),
  };
}

export async function listRows(table, sort, limit) {
  let query = supabase.from(table).select('*');
  query = applySort(query, sort);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(withDateAliases);
}

export async function filterRows(table, criteria = {}, sort, limit) {
  let query = supabase.from(table).select('*').match(criteria);
  query = applySort(query, sort);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(withDateAliases);
}

export async function createRow(table, data) {
  const { data: row, error } = await supabase.from(table).insert(data).select().single();
  if (error) throw error;
  return withDateAliases(row);
}

export async function updateRow(table, id, data) {
  const { data: row, error } = await supabase.from(table).update(data).eq('id', id).select().single();
  if (error) throw error;
  return withDateAliases(row);
}

export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
}

/**
 * Subscribes to Postgres changes for `table`, optionally filtered by an
 * equality match (e.g. { column: 'stream_id', value: streamId }).
 * Returns an unsubscribe function.
 */
export function subscribeRows(table, callback, filter) {
  const channelName = filter ? `${table}:${filter.column}:${filter.value}` : `${table}:all`;
  let changesConfig = { event: '*', schema: 'public', table };
  if (filter) {
    changesConfig = { ...changesConfig, filter: `${filter.column}=eq.${filter.value}` };
  }

  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', changesConfig, (payload) => callback(payload))
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function uploadFile(bucket, file, pathPrefix = '') {
  const ext = file.name.split('.').pop();
  const path = `${pathPrefix}${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { file_url: data.publicUrl };
}
