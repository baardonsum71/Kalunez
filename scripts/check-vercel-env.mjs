/**
 * Fail Vercel builds when the Web Billing public key is missing.
 * Checks process.env first, then committed .env.production (public SDK key).
 * Local / GitHub CI skip this (no VERCEL=1).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

if (!process.env.VERCEL) process.exit(0);

function keyFromEnvFile() {
  const path = resolve(process.cwd(), '.env.production');
  if (!existsSync(path)) return '';
  const text = readFileSync(path, 'utf8');
  const match = text.match(/^\s*VITE_REVENUECAT_PUBLIC_KEY\s*=\s*(.+)\s*$/m);
  if (!match) return '';
  return match[1].trim().replace(/^["']|["']$/g, '');
}

const key = process.env.VITE_REVENUECAT_PUBLIC_KEY || keyFromEnvFile();
if (!key.startsWith('rcb_')) {
  console.error(
    [
      '',
      '❌ Missing or invalid VITE_REVENUECAT_PUBLIC_KEY on Vercel.',
      '   Expected a Web Billing key starting with rcb_',
      '   Fix: keep it in .env.production, or set the Vercel env var',
      '   Name must be exactly: VITE_REVENUECAT_PUBLIC_KEY',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

console.log('✓ VITE_REVENUECAT_PUBLIC_KEY present for Vercel build');
