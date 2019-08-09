const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	devtool: 'source-map',
  entry: './src/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production',
  target: 'web',
  optimization: {
    minimizer: [
    	new TerserPlugin({
	    	terserOptions: {
	    		beautify: false,
	        comments: false,
	        compress: {
            sequences: true,
            booleans: true,
            loops: true,
            unused: true,
            warnings: false,
            drop_console: true,
            unsafe: true
	        }
	    	}
    	})
  	],
  }
};