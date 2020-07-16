const path = require('path');
const { globalStyle } = require('svelte-preprocess');
const ExtensionReloadPlugin = require('webpack-extension-reloader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackBar = require('webpackbar');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const defaultManifestJson = require('../src/manifest.json');
const packageJson = require('../package.json');

const rootDir = path.resolve(__dirname, '../');
const srcDir = path.resolve(rootDir, 'src');
const buildDir = path.resolve(rootDir, 'build');
const defaultTemplate = path.resolve(srcDir, 'templates', 'page.ejs');

module.exports.entry = {
  popup: path.resolve(srcDir, 'pages/popup'),
  background: path.resolve(srcDir, 'pages/background'),
};
module.exports.output = {
  path: path.resolve(buildDir, 'unpacked'),
  publicPath: '/',
  filename: 'js/[name]_[hash].js',
  chunkFilename: 'js/[name]_[hash].js',
  library: '[name]',
};
module.exports.resolve = {
  extensions: ['.mjs', '.js'],
  alias: {
    '~': rootDir,
  },
};
module.exports.svelteLoader = {
  test: /\.(html|svelte)$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'svelte-loader',
      options: {
        emitCss: true,
        preprocess: [
          globalStyle(),
        ],
      },
    },
  ],
};
module.exports.cssLoader = {
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
  ],
};
module.exports.svgInlineLoader = {
  test: /\.svg$/,
  loader: 'svg-inline-loader'
};
module.exports.babelLoader = {
  test: /\.js$/,
  exclude: /[\\/]node_modules[\\/]/,
  loader: 'babel-loader',
};
module.exports.esLintLoader = {
  enforce: 'pre',
  test: /\.js|vue$/,
  exclude: /node_modules/,
  loader: 'eslint-loader',
};
module.exports.workerLoader = {
  test: /\.worker\.js$/,
  loader: 'worker-loader',
};
module.exports.plugins = [
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.join(rootDir, 'static', 'icons'),
        to: 'icons',
      },
    ]
  }),
  new WebpackBar(),
  new GenerateJsonPlugin('manifest.json', {
    ...defaultManifestJson,
    version: packageJson.version,
    description: packageJson.description,
  }),
];
module.exports.extensionReloadPlugin = new ExtensionReloadPlugin({
  entries: {
    background: 'background',
    extensionPage: ['popup'],
  },
});
module.exports.performance = {
  hints: false,
};
module.exports.stats = 'minimal';
module.exports.devtool = 'source-map';
module.exports.optimization = (env) => {
  const isProd = env === 'production';
  const minimizerPlugin = new TerserPlugin();
  const optimizeCSSAssetsPlugin = isProd && new OptimizeCSSAssetsPlugin();
  const minimizer = isProd
    ? [minimizerPlugin, optimizeCSSAssetsPlugin]
    : [minimizerPlugin];
  return {
    sideEffects: true,
    usedExports: true,
    minimize: isProd,
    minimizer,
    splitChunks: {
      automaticNameDelimiter: '.',
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          enforce: true,
          chunks: 'all',
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  };
};
module.exports.htmlPage = (title, filename, chunks, template) => new HtmlWebpackPlugin({
  title,
  hash: false,
  cache: true,
  inject: 'body',
  filename: `./pages/${filename}.html`,
  template: template || defaultTemplate,
  appMountId: 'app',
  chunks,
  minify: {
    collapseWhitespace: true,
  },
});
module.exports.cleanPlugin = new CleanWebpackPlugin();
module.exports.ZipPlugin = new ZipPlugin({
  path: buildDir,
  filename: `build-${packageJson.version}.zip`,
});
module.exports.notifierPlugin = new WebpackNotifierPlugin({
  title: packageJson.name,
  alwaysNotify: true,
  contentImage: path.join(rootDir, 'webpack/logo.png'),
});
