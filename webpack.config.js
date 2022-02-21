module.exports = {
  target: 'node',
  externals: {'aws-sdk': 'aws-sdk'},
  mode: 'none'
}



// webpack.config.js
// const path = require('path');
// const slsw = require('serverless-webpack');

// module.exports = {
//   entry: slsw.lib.entries,
//   target: 'node',
//   mode: 'none',
//   stats: 'minimal',
//   devtool: 'nosources-source-map',
//   devtool: 'source-map',
//   // Since 'aws-sdk' is not compatible with webpack,
//   // we exclude all node dependencies
//   externals: {'aws-sdk': 'aws-sdk'},
//   performance: {
//     hints: false,
//   },
//   resolve: {
//     extensions: ['.js', '.jsx', '.json'],
//   },
//   output: {
//     libraryTarget: 'commonjs2',
//     path: path.join(__dirname, '.webpack'),
//     filename: '[name].js',
//     sourceMapFilename: '[file].map',
//   },
//   module: {
//     rules: [
//       {
//         test: '/\.js$/',
//         include: __dirname,
//         exclude: '/node_modules/'
//       }
//     ]
//   }
// };