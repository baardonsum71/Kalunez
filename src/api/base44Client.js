import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const normalizedAppBaseUrl = typeof appBaseUrl === 'string' ? appBaseUrl.replace(/\/$/, '') : '';

// Dev: empty serverUrl → relative /api (Vite proxy). Prod: direct Base44 app API.
const serverUrl = import.meta.env.DEV ? '' : normalizedAppBaseUrl;

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl: normalizedAppBaseUrl,
});
