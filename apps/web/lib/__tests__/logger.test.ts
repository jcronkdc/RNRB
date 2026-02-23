import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from '../logger';

describe('createLogger', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (process.env as Record<string, string>).NODE_ENV = originalEnv as string;
  });

  it('creates a logger with the given context', () => {
    const log = createLogger('TestContext');
    expect(log).toHaveProperty('debug');
    expect(log).toHaveProperty('info');
    expect(log).toHaveProperty('warn');
    expect(log).toHaveProperty('error');
  });

  it('includes context in log messages', () => {
    const log = createLogger('API');
    log.error('something failed');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[API]'),
      expect.anything()
    );
  });

  it('includes level in log messages', () => {
    const log = createLogger('DB');
    log.warn('connection slow');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]'),
      expect.anything()
    );
  });

  it('passes data as second argument', () => {
    const log = createLogger('Auth');
    const data = { userId: '123' };
    log.error('auth failed', data);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[Auth]'),
      data
    );
  });
});
