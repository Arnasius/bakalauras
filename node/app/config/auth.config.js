const crypto = require("crypto");
const serverSecret = crypto.randomBytes(256).toString("base64");
const clientSecret = crypto.randomBytes(256).toString("base64");
module.exports = {
  clientSecret: clientSecret,
  serverSecret: serverSecret,
  expiresIn: 86400, // 24 hours
};
