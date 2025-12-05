import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import pluginPromise from 'eslint-plugin-promise';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const importRecommendedRules = pluginImport.configs?.recommended?.rules ?? {};
const promiseRecommendedRules = pluginPromise.configs?.recommended?.rules ?? {};

/**
 * ESLint configuration for library packages (db, auth, trpc)
 * Does not include tailwindcss or jsx-a11y plugins (not needed for backend/library code)
 */
export default tseslint.config(
  {
    name: 'cronkwaters/ignores',
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/node_modules/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: 'cronkwaters/library',
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: process.cwd()
      }
    },
    plugins: {
      import: pluginImport,
      promise: pluginPromise,
      'unused-imports': pluginUnusedImports
    },
    rules: {
      ...importRecommendedRules,
      ...promiseRecommendedRules,
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
      ],
      'import/no-unresolved': 'off',
      'import/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            ['internal'],
            ['parent', 'sibling', 'index']
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],
      'import/no-default-export': 'error'
    }
  },
  prettier
);


