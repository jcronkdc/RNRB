import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('env validation', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('exports env object with NODE_ENV', async () => {
    const mod = await import('../env');
    expect(mod.env).toBeDefined();
    expect(mod.env.NODE_ENV).toBeDefined();
  });

  it('exports features object', async () => {
    const mod = await import('../env');
    expect(mod.features).toBeDefined();
    expect(typeof mod.features.ai).toBe('boolean');
    expect(typeof mod.features.payments).toBe('boolean');
    expect(typeof mod.features.realtime).toBe('boolean');
    expect(typeof mod.features.video).toBe('boolean');
    expect(typeof mod.features.storage).toBe('boolean');
  });

  it('reports ai as disabled when no API keys set', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const mod = await import('../env');
    expect(mod.features.ai).toBe(false);
  });

  it('reports payments as disabled when no Stripe key', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const mod = await import('../env');
    expect(mod.features.payments).toBe(false);
  });
});
