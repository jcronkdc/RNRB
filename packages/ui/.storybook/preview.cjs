require('../src/styles.css');

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
};

module.exports = preview;

