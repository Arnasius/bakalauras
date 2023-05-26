const config = require("../config/db.config");
const { Pool } = require("pg");

const pool = new Pool(config);

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = {
  async query(text, params) {
    // Uncomment to log performance and queries
    // const start = Date.now()
    const res = await pool.query(text, params);
    // const duration = Date.now() - start
    // console.log('executed query', { text, duration, rows: res.rowCount })
    return res;
  },

  async getClient() {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    const timeout = setTimeout(() => {
      console.error("A client has been checked out for more than 5 seconds!");
      console.error(
        `The last executed query on this client was: ${client.lastQuery}`
      );
    }, 5000);

    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    client.release = () => {
      clearTimeout(timeout);

      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    return client;
  },
};
