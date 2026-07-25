import { requireUser, getServiceClient, jsonResponse } from '../_shared/client.ts';

Deno.serve(async (req) => {
  try {
    const { user } = await requireUser(req);
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const service = getServiceClient();
    const { error } = await service.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return jsonResponse({ deleted: true });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});
