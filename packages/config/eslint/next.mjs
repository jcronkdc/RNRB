import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import baseConfig from './base.mjs';

const nextCoreWebVitalsRules =
  nextPlugin.configs?.['core-web-vitals']?.rules ?? {};
const reactRecommendedRules = reactPlugin.configs?.recommended?.rules ?? {};
const reactHooksRecommendedRules =
  reactHooksPlugin.configs?.recommended?.rules ?? {};

export default [
  ...baseConfig,
  {
    name: 'cronkwaters/next',
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    languageOptions: {
      globals: {
        React: false
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      ...nextCoreWebVitalsRules,
      ...reactRecommendedRules,
      ...reactHooksRecommendedRules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // Allow default exports for Next.js pages, layouts, and route handlers
      'import/no-default-export': 'off'
    }
  },
  {
    name: 'cronkwaters/next-pages',
    files: ['**/app/**/*.{ts,tsx}', '**/pages/**/*.{ts,tsx}', '**/*page.{ts,tsx}', '**/*layout.{ts,tsx}', '**/*route.{ts,tsx}', '**/*loading.{ts,tsx}', '**/*error.{ts,tsx}', '**/*not-found.{ts,tsx}', '**/*template.{ts,tsx}', '**/*default.{ts,tsx}'],
    rules: {
      'import/no-default-export': 'off'
    }
  },
  {
    name: 'cronkwaters/next-config',
    files: ['**/next.config.{ts,js}', '**/tailwind.config.{ts,js}', '**/postcss.config.{mjs,js}', '**/eslint.config.{mjs,js}'],
    rules: {
      'import/no-default-export': 'off'
    }
  }
];

