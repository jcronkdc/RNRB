import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import libraryConfig from './library.mjs';

const reactRecommendedRules = reactPlugin.configs?.recommended?.rules ?? {};
const reactHooksRecommendedRules =
  reactHooksPlugin.configs?.recommended?.rules ?? {};

/**
 * ESLint configuration for React library packages (ui)
 * Includes React rules but NOT tailwindcss plugin (incompatible with tailwindcss v4)
 */
export default [
  ...libraryConfig,
  {
    name: 'cronkwaters/react-library',
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


