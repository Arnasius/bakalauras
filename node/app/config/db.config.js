module.exports = {
  user: "postgres",
  host: process.env.DB_HOST || "localhost",
  database: "prism-db",
  password: "postgres",
  port: 5432,
};
