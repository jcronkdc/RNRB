import nextConfig from '@songforge/config/eslint/next';

export default [
  ...nextConfig,
  {
    ignores: ['**/public/sw.js', '**/next-env.d.ts', '**/.next/**']
  }
];

