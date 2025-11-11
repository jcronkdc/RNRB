import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import baseConfig from './base.mjs';

const reactRecommendedRules = reactPlugin.configs?.recommended?.rules ?? {};
const reactHooksRecommendedRules =
  reactHooksPlugin.configs?.recommended?.rules ?? {};

export default [
  ...baseConfig,
  {
    name: 'songforge/react',
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      ...reactRecommendedRules,
      ...reactHooksRecommendedRules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off'
    }
  }
];

