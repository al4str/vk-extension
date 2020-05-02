// For IDEs usage only
// Auto alias path resolving

const path = require('path');

module.exports = {
  resolve: {
    extensions: ['.js', '.svelte'],
    alias: {
      '~': path.resolve(__dirname),
    },
  },
};
