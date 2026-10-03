// Keep the existing scheduled workflow entry point stable.
if (!process.argv.includes('--metrics-only')) await import('./build-particles.mjs');
await import('./render-activity.mjs');
