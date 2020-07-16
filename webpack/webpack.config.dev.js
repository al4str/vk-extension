const {
  devtool,
  resolve,
  entry,
  output,
  stats,
  babelLoader,
  svgInlineLoader,
  svelteLoader,
  cssLoader,
  esLintLoader,
  workerLoader,
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
  devtool,
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
      workerLoader,
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
