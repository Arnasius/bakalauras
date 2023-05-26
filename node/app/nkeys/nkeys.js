const { createUser } = require("nkeys.js");
const fs = require("fs");
const { initial_nkeys } = require("../nats/config_proxy");
const config = require("../config/path.config");

const path = config.nkeys;
module.exports.node_nkeys = () => {
  try {
    fs.statSync(`${path}/node-nkeys.seed`);
    const existingNode = fs.readFileSync(`${path}/node-nkeys.pub`, "utf8");
    initial_nkeys(existingNode, "node-client");
  } catch (err) {
    if (err.code === "ENOENT") {
      const nodeUser = createUser();
      const nodeSeed = nodeUser.getSeed();
      const nodePublic = nodeUser.getPublicKey();
      fs.writeFileSync(`${path}/node-nkeys.seed`, nodeSeed);
      fs.writeFileSync(`${path}/node-nkeys.pub`, nodePublic);
      initial_nkeys(nodePublic, "node-client");
    }
  }
};

module.exports.subscriber_nkeys = () => {
  try {
    fs.statSync(`${path}/subscriber-nkeys.seed`);
    const existingSubscriber = fs.readFileSync(
      `${path}/subscriber-nkeys.pub`,
      "utf8"
    );
    initial_nkeys(existingSubscriber, "subscriber");
  } catch (err) {
    if (err.code === "ENOENT") {
      const subUser = createUser();
      const subSeed = subUser.getSeed();
      const subPublic = subUser.getPublicKey();
      fs.writeFileSync(`${path}/subscriber-nkeys.seed`, subSeed);
      fs.writeFileSync(`${path}/subscriber-nkeys.pub`, subPublic);
      initial_nkeys(subPublic, "subscriber");
    }
  }
};
