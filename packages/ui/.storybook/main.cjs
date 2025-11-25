const path = require('node:path');

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (baseConfig) => {
    const merged = baseConfig;
    merged.resolve ??= {};
    merged.resolve.alias ??= {};
    merged.resolve.alias['@cronkwaters/ui'] = path.resolve(__dirname, '../src');
    return merged;
  },
};

module.exports = config;
