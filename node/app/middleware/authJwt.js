const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

const verifyToken = async (req, res, next) => {
  let serverToken = req.cookies.serverToken;
  let clientToken = req.cookies.clientToken;
  if (serverToken == undefined || clientToken == undefined) {
    res.clearCookie("serverToken").clearCookie("clientToken");
    return res.status(401).send({
      message: "No token provided!",
    });
  }
  jwt.verify(clientToken, config.clientSecret, (err, _) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    } else {
      jwt.verify(serverToken, config.serverSecret, (err, decoded) => {
        if (err) {
          return res.status(401).send({
            message: "Unauthorized!",
          });
        }
        req.userId = decoded.id;
        req.isSuperAdmin = decoded.isSuperAdmin;
        next();
      });
    }
  });
};

const authJwt = {
  verifyToken: verifyToken,
};
module.exports = authJwt;
