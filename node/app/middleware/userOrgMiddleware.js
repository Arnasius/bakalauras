const { cacheInstance } = require("../services/node-cache");
const util = require("util");

exports.invalidateCache = (req, res, next) => {
  if (req.params.id && req.params.org) {
    const cache_id = util.format("%s_%s", req.params.id, req.params.org);
    cacheInstance().del(cache_id);
  } else if (req.params.id) {
    // Its user delete, so remove all cached userid+orgid keys
    const prefix = util.format("%s_", req.params.id);
    const keys = cacheInstance().keys();
    let deletable_keys = [];

    for (let key in keys) {
      if (keys[key].startsWith(prefix)) {
        deletable_keys.push(keys[key]);
      }
    }
    if (deletable_keys.length !== 0) {
      cacheInstance().del(deletable_keys);
    }
  } else {
    console.warn("invalidateCache: err userid and/or orgid is missing in req");
  }

  next();
};
