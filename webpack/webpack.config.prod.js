const {
  devtool,
  resolve,
  entry,
  output,
  stats,
  optimization,
  babelLoader,
  svelteLoader,
  svgInlineLoader,
  cssLoader,
  esLintLoader,
  workerLoader,
  plugins,
  htmlPage,
  cleanPlugin,
  ZipPlugin,
} = require('./webpack.config.base');

const mode = 'production';

module.exports = {
  mode,
  devtool,
  resolve,
  entry,
  output,
  stats,
  optimization: optimization(mode),
  module: {
    rules: [
      babelLoader,
      svelteLoader,
      esLintLoader,
      svgInlineLoader,
      cssLoader,
      workerLoader,
    ],
  },
  plugins: [
    cleanPlugin,
    htmlPage('popup', 'popup', ['manifest', 'vendors', 'runtime', 'popup']),
    htmlPage('background', 'background', ['manifest', 'vendors', 'runtime', 'background']),
    ...plugins,
    ZipPlugin,
  ],
};
