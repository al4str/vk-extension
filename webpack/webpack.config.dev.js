const {
  resolve,
  entry,
  output,
  stats,
  babelLoader,
  svgInlineLoader,
  svelteLoader,
  cssLoader,
  esLintLoader,
  plugins,
  extensionReloadPlugin,
  htmlPage,
  notifierPlugin,
} = require('./webpack.config.base');

const mode = 'development';

const watch = true;

module.exports = {
  mode,
  watch,
  resolve,
  entry,
  output,
  stats,
  module: {
    rules: [
      esLintLoader,
      babelLoader,
      svelteLoader,
      cssLoader,
      svgInlineLoader,
    ],
  },
  plugins: [
    notifierPlugin,
    htmlPage('popup', 'popup', ['manifest', 'vendors', 'popup']),
    htmlPage('background', 'background', ['manifest', 'vendors', 'background']),
    ...plugins,
    extensionReloadPlugin,
  ],
};
