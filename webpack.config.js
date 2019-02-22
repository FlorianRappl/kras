const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const env = process.env.NODE_ENV || 'development';
const production = env === 'production';
const develop = !production;
const port = process.env.PORT || 8080;

const dist = path.join(__dirname, 'dist', 'client');
const src = path.join(__dirname, 'src', 'client');

function getEntrySources(sources = []) {
  if (develop) {
    sources.push(`webpack-dev-server/client?http://0.0.0.0:${port}`);
  }

  return sources;
}

module.exports = {
  devtool: develop && 'source-map',

  entry: {
    main: getEntrySources([path.join(src, 'index.tsx')]),
  },

  mode: develop ? 'development' : 'production',

  output: {
    path: dist,
    publicPath: 'static/',
    filename: 'kras.js',
  },

  devServer: {
    port,
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: 'tsconfig.client.json',
        },
      },
      {
        test:/\.css$/,
        use:['style-loader','css-loader']
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      minify: {
        collapseWhitespace: true,
        quoteCharacter: '"',
        removeAttributeQuotes: true,
      },
      favicon: path.resolve(src, 'favicon.ico'),
      inject: 'body',
      template: path.resolve(src, 'index.html'),
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
  ],
};
