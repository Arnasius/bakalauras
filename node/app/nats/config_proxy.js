const config = require("../config/nats.config");
const util = require("util");
const axios = require("axios");

/* [RESOURCE]                         [SUPPORTED METHODS]
 * ------------------------------------------------------
 * /v1/auth/idents/{name}              GET, PUT, DELETE
 * /v1/auth/perms/{name}               GET, PUT, DELETE
 * /v1/auth/accounts/{name}            GET, PUT, DELETE
 *
 * v2 - v2.0 NATS Accounts format
 * ------------------------------------------------------
 * /v2/auth/validate                   POST
 * /v2/auth/snapshot?name={name}       POST, DELETE
 * /v2/auth/publish?name={name}        POST
 */

const auth = {
  ident: "/v1/auth/idents/%s",
  idents: "/v1/auth/idents",
  perm: "/v1/auth/perms",
  perms: "/v1/auth/perms/%s",
  account: "/v1/auth/accounts/%s",
  accounts: "/v1/auth/accounts",
  validate: "/v2/auth/validate",
  snapshot_name: "/v2/auth/snapshot?name=%s",
  snapshot: "/v2/auth/snapshot",
  publish_name: "/v2/auth/publish?name=%s",
  publish: "/v2/auth/publish",
};

const url_base = `http://${config.proxy_host}:${config.proxy_port}%s`;

const import_topics = async (orgs, publish = true) => {
  const url = util.format(url_base, util.format(auth.account, "default"));
  let data = { imports: [] };
  let orgid;
  try {
    for (let i = 0; i < orgs.length; i++) {
      orgid = orgs[i].orgid.toString();
      data.imports.push({
        stream: {
          account: orgid,
          subject: `v1.organization.${orgid}.device.*.*`,
        },
      });
      data.imports.push({
        service: {
          account: orgid,
          subject: `v1.organization.${orgid}.device.*.*`,
        },
      });
      data.imports.push({
        service: {
          account: orgid,
          subject: `v1.organization.${orgid}.group.*.*`,
        },
      });
    }
    await axios.put(url, JSON.stringify(data));
    if (publish) await publish_config();
  } catch (err) {
    console.error(err);
  }
};

const publish_config = async () => {
  const url = util.format(url_base, util.format(auth.publish));

  try {
    await axios.post(url, {});
  } catch (err) {
    console.error(err);
  }
};

// register_device(<device-id>, <organization-id>, <nkeys-string>)
const register_device = async (name, organization_id, nk, publish = true) => {
  const url = util.format(url_base, util.format(auth.ident, name));
  const data = JSON.stringify({
    nkey: nk.toString(),
    permissions: "client",
    account: organization_id.toString(),
  });

  await axios
    .put(url, data)
    .then(() => {
      if (publish) publish_config();
    })
    .catch(async (error) => {
      console.error(error.response);
      console.error(`Configuration for ${name} failed. Retrying...`);
      await axios
        .put(url, data)
        .then(() => {
          if (publish) publish_config();
          console.info(`Configuration for ${name} is successfully published.`);
        })
        .catch(() => {
          console.error("Configuration failed.");
        });
    });
};

const delete_device = async (name, publish = true) => {
  const url = util.format(url_base, util.format(auth.ident, name));

  await axios
    .delete(url)
    .then(() => {
      if (publish) publish_config();
    })
    .catch((error) => {
      console.error(error);
    });
};

const add_organization = async (organization_id, publish = true) => {
  const url = util.format(url_base, util.format(auth.account, organization_id));
  const data = {
    exports: [
      {
        stream: `v1.organization.${organization_id}.device.*.*`,
        accounts: ["default"],
      },
      {
        service: `v1.organization.${organization_id}.device.*.*`,
        accounts: ["default"],
      },
      {
        service: `v1.organization.${organization_id}.group.*.*`,
        accounts: ["default"],
      },
    ],
  };

  await axios
    .put(url, data)
    .then(() => {
      if (publish) publish_config();
    })
    .catch(async (error) => {
      console.error(error.response);
      console.error(
        `Configuration for organization ${organization_id} failed. Retrying...`
      );
      await axios
        .put(url, data)
        .then(() => {
          if (publish) publish_config();
          console.info(
            `Configuration for organization ${organization_id} is successfully published.`
          );
        })
        .catch(() => {
          console.error("Configuration failed.");
        });
    });
};

const initial_nkeys = async (nkey, name) => {
  const url = util.format(url_base, util.format(auth.ident, name));

  const data = {
    nkey: nkey,
    permissions: name == "subscriber" ? "subscriber" : "node-client",
    account: "default",
  };

  try {
    await axios.put(url, data);
  } catch (e) {
    console.error(e);
  }
};

const delete_organization = async (organization_id, publish = true) => {
  const url = util.format(url_base, util.format(auth.account, organization_id));

  await axios
    .delete(url)
    .then(() => {
      if (publish) publish_config();
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  publish_config: publish_config,
  register_device: register_device,
  delete_device: delete_device,
  add_organization: add_organization,
  delete_organization: delete_organization,
  import_topics: import_topics,
  initial_nkeys: initial_nkeys,
};
