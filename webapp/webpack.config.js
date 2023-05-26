const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: getEntryPoints(),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.jsx'
    //.filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'node_modules',
      'local_modules',
      /* path.resolve(__dirname, 'lib/'), */
      path.resolve(__dirname, 'src/')
    ],
    /*
    alias: {
      'react': path.resolve(__dirname, 'lib/react/react.development.js'),
      'react-dom': path.resolve(__dirname, 'lib/react/react-dom.development.js')
    }
    */
  },
  plugins: getPlugins(),
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(css|scss)(\?\S*)?$/,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader',
        }, {
          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [
                require('precss'),
                require('autoprefixer')
              ];
            }
          }
        }, {
          loader: 'sass-loader'
        }]
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100000,
              name: '[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  /* Valid when config used with webpack-dev-server */
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: false,
    inline: true,
    port: 9000,
    host: '0.0.0.0',
    historyApiFallback: true,
    proxy: {
      '/ws': {
        "changeOrigin": true,
        "target": 'ws://localhost:3000',
        ws: true,
        onProxyReq: proxyReq => {
          if (proxyReq.getHeader('origin')) {
            proxyReq.setHeader('origin', 'ws://localhost:3000');
          }
        },
      },
      '/api': {
        "changeOrigin": true,
        "target": 'http://localhost:3000',
        onProxyReq: proxyReq => {
          // Browers may send Origin headers even with same-origin
          // requests. To prevent CORS issues, we have to change the Origin to match the target URL.
          if (proxyReq.getHeader('origin')) {
            proxyReq.setHeader('origin', 'http://localhost:3000');
          }
        }
      },
    },
  }
};

function getEntryPoints() {
  let entries = [];

  /* Entries order matter, first one gets loaded first! */
  entries.push(process.env.BRAND ? './src/brands/' + process.env.BRAND + '/index.js' : './src/index.js');

  return entries;
}

function getPlugins() {
  const pi = [];

  if (process.env.MINIFY == 'y') {
    pi.push(new TerserPlugin({}, {test: /\.jsx?$/, exclude: /node_modules/}))
  }

  return pi;
}
