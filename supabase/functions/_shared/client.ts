import { createClient } from 'npm:@supabase/supabase-js@2';

/**
 * Client scoped to the requesting user's JWT — respects RLS.
 */
export function getUserClient(req: Request) {
  const authHeader = req.headers.get('Authorization') ?? '';
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );
}

/**
 * Service-role client — bypasses RLS. Only use for privileged operations
 * (webhooks, admin queries, cross-user writes).
 */
export function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

export async function requireUser(req: Request) {
  const supabase = getUserClient(req);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return { user: null, supabase };
  return { user: data.user, supabase };
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
