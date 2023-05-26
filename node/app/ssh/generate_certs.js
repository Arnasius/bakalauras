const { NodeSSH } = require("node-ssh");
const util = require("util");
const config = require("../config/nginx.config");

const ssh = new NodeSSH();

const cmd_body = `sh generate-cert.sh %s`;

const options = {
  SS: "generate_self_signed %s",
  LE: "generate_lets_encrypt %s",
  CERT: "upload_certs",
};

const nginx_config = {
  host: config.host,
  username: config.user,
  password: config.pass,
};

module.exports.generate_cert = async (sslType, domainName) => {
  const cmd = util.format(
    cmd_body,
    util.format(sslType ? options[sslType] : "disable_https", domainName)
  );

  ssh
    .connect(nginx_config)
    .then(() => {
      ssh
        .execCommand(cmd, { cwd: "/home/scripts/" })
        .then((res) => {
          console.warn("SSH cmd to Nginx STDOUT: " + res.stdout);
        })
        .catch((err) => {
          console.error("SSH cmd execute to Nginx STDERR: " + err.stderr);
        });
    })
    .catch((err) => {
      console.error("SSH connection to Nginx error: " + err);
    });
};
