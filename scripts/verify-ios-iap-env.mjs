#!/usr/bin/env node
/**
 * Fail fast before an iOS Archive if the App Store RevenueCat key is missing.
 * App Review sees purchase errors when appl_ was never baked into the bundle.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const envFiles = ['.env.local', '.env'].map((f) => resolve(root, f));

function readEnvFile(path) {
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf8');
}

const blob = envFiles.map(readEnvFile).join('\n');
const match = blob.match(/^\s*VITE_REVENUECAT_IOS_PUBLIC_KEY\s*=\s*(.+)$/m);
const raw = match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
const fromProcess = String(process.env.VITE_REVENUECAT_IOS_PUBLIC_KEY || '').trim();
const key = raw || fromProcess;

if (!key.startsWith('appl_')) {
  console.error(`
❌ iOS IAP build blocked: VITE_REVENUECAT_IOS_PUBLIC_KEY must start with appl_

Add to .env.local (project root):
  VITE_REVENUECAT_IOS_PUBLIC_KEY=appl_...

Then:
  npm run build:ios && npx cap sync ios

Never put appl_ in VITE_REVENUECAT_PUBLIC_KEY (that one is rcb_ for web only).
`);
  process.exit(1);
}

console.log(`✅ iOS RevenueCat key OK (appl_…, length ${key.length})`);
