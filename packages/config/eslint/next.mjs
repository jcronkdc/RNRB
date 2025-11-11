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
    name: 'songforge/next',
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
      'react/jsx-uses-react': 'off'
    }
  }
];

