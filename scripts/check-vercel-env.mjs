/**
 * Fail Vercel builds when the Web Billing public key is missing.
 * Local / GitHub CI skip this (no VERCEL=1).
 */
if (!process.env.VERCEL) process.exit(0);

const key = process.env.VITE_REVENUECAT_PUBLIC_KEY || '';
if (!key.startsWith('rcb_')) {
  console.error(
    [
      '',
      '❌ Missing or invalid VITE_REVENUECAT_PUBLIC_KEY on Vercel.',
      '   Expected a Web Billing key starting with rcb_',
      '   Vercel → Project → Settings → Environment Variables',
      '   Name must be exactly: VITE_REVENUECAT_PUBLIC_KEY',
      '   Environment: Production (and Preview if you use it)',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

console.log('✓ VITE_REVENUECAT_PUBLIC_KEY present for Vercel build');
