
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, 'dist');
const APP_DIR = path.resolve(__dirname, 'src');

module.exports = {
  entry: `${APP_DIR}/lucchetto.js`,
  output: {
    path: BUILD_DIR,
    filename: 'lucchetto.js',
    library: '__lucchetto__',
    libraryTarget: 'umd',
    umdNamedDefine: true    
  }
};