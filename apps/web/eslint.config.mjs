import nextConfig from '@cronkwaters/config/eslint/next';

export default [
  ...nextConfig,
  {
    ignores: ['**/public/sw.js', '**/next-env.d.ts', '**/.next/**']
  },
  {
    rules: {
      // Turn off strict unused imports for build
      'unused-imports/no-unused-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'unused-imports/no-unused-vars': 'warn',
      // Turn off other strict rules
      'import/order': 'off',
      'tailwindcss/classnames-order': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'react/no-unescaped-entities': 'off',
      'import/no-duplicates': 'off'
    }
  }
];

