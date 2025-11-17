import base from '@cronkwaters/config/eslint/base';

export default [
  ...base,
  {
    ignores: [
      '**/node_modules/**',
      '**/.turbo/**',
      '**/dist/**',
      '**/.next/**',
      'pnpm-lock.yaml',
      'test-results/**',
      'apps/web/public/sw.js'
    ]
  }
];
