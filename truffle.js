require('babel-register')({
  ignore: /node_modules\/(?!zeppelin-solidity)/,
  babelrc: false,
  "presets": [
    ["env", {
      "targets": {
        "node": "current"
      }
    }], "stage-2", "stage-3"
  ]
});
require('babel-polyfill');

module.exports = {
  // http://truffleframework.com/docs/advanced/configuration
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gasLimit: 50000
    }
  }
};
