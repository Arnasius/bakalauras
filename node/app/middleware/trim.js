const trim = async (req, res, next) => {
  Object.keys(req.body).map(
    (k) =>
      (req.body[k] =
        typeof req.body[k] == "string" && !k.includes("pass")
          ? req.body[k].trim()
          : req.body[k])
  ),
    next();
};

const trimObject = {
  trim: trim,
};

module.exports = trimObject;
