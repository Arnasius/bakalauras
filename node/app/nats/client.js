const fs = require("fs");
const config = require("../config/nats.config");
const { connect, nkeyAuthenticator, StringCodec, JSONCodec } = require("nats");

const server = `${config.server_host}:${config.client_port}`;
const nkeys_path = "/home/nkeys/node-nkeys.seed";
var nc;

function read_nkey(path) {
  const nk = fs.readFileSync(path, "utf8");
  return nk.trim();
}

const tlsOptions = {
  keyFile: "./certs/client-key.pem",
  certFile: "./certs/client-cert.pem",
  caFile: "./certs/rootCA.pem",
};

async function get_connection() {
  const nkey = read_nkey(nkeys_path);
  const seed = new TextEncoder().encode(nkey);
  if (!nc) {
    try {
      nc = await connect({
        servers: server,
        tls: tlsOptions,
        authenticator: nkeyAuthenticator(seed),
      });
    } catch (err) {
      console.error(
        `Nats node client: error connecting to nats: ${err.message}`
      );
    }
  }

  // In case connection closed.
  nc.closed().then((err) => {
    if (err) {
      console.error(`Nats node client: closed with an error: ${err.message}`);
    }
  });

  return nc;
}

module.exports.publish = async (subject, message) => {
  const nats = await get_connection();
  const sc = StringCodec();

  try {
    nats.publish(subject, sc.encode(message));
  } catch (err) {
    console.error(`Nats node client: error publishing to nats: ${err.message}`);
  }
};

module.exports.publish_json = async (subject, json) => {
  const nats = await get_connection();
  const jc = JSONCodec();

  try {
    nats.publish(subject, jc.encode(json));
  } catch (err) {
    console.error(`Error publishing to nats: ${err.message}`);
  }
};
