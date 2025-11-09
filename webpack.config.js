const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'DRPG2 - Wizardry-like Game',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets', noErrorOnMissing: true },
        { from: 'src/data', to: 'src/data' },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8080,
    hot: true,
    open: true,
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.post('/api/log', (req, res) => {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const logData = JSON.parse(body);
            const logFilePath = path.join(__dirname, 'debug.log');
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] ${logData.level} [${logData.module}] ${logData.message}${logData.data ? ' ' + JSON.stringify(logData.data) : ''}\n`;

            fs.appendFileSync(logFilePath, logEntry);
            res.json({ success: true });
          } catch (error) {
            console.error('Error writing log:', error);
            res.status(500).json({ success: false, error: error.message });
          }
        });
      });

      return middlewares;
    },
  },
};
