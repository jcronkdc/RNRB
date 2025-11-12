import nextConfig from '@songforge/config/eslint/next';

export default [
  ...nextConfig,
  {
    ignores: ['**/public/sw.js', '**/next-env.d.ts', '**/.next/**']
  },
  {
    rules: {
      'unused-imports/no-unused-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'unused-imports/no-unused-vars': 'warn',
    }
  }
];

