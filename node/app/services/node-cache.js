const nodeCache = require("node-cache");
let storage;

function cacheInit() {
  if (storage) {
    return;
  }

  storage = new nodeCache();
}

function cacheInstance() {
  return storage;
}

module.exports = {
  cacheInit,
  cacheInstance,
};
