const BTH = require('./src/sources/bth');

const convenienceMethods = require('./src/convenience-methods');

module.exports = {
  BTH,
  sources: [
    BTH
  ],
  ...convenienceMethods
};
