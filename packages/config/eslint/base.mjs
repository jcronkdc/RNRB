import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginPromise from 'eslint-plugin-promise';
import pluginTailwind from 'eslint-plugin-tailwindcss';
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const importRecommendedRules = pluginImport.configs?.recommended?.rules ?? {};
const jsxA11yRecommendedRules = pluginJsxA11y.configs?.recommended?.rules ?? {};
const promiseRecommendedRules = pluginPromise.configs?.recommended?.rules ?? {};

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
    name: 'cronkwaters/base',
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
      'jsx-a11y': pluginJsxA11y,
      promise: pluginPromise,
      tailwindcss: pluginTailwind,
      'unused-imports': pluginUnusedImports
    },
    settings: {
      tailwindcss: {
        callees: ['cn', 'classnames', 'ctl'],
        config: 'tailwind.config.ts',
        cssFiles: ['**/*.css'],
        removeDuplicates: true
      }
    },
    rules: {
      ...importRecommendedRules,
      ...jsxA11yRecommendedRules,
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
      'import/no-default-export': 'error',
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'off'
    }
  },
  prettier
);

