/** Database connection for messagely. */


const { Client } = require("pg");
const { DB } = require("./config");

/* const client = new Client(DB_URI); */

const client = new Client({
    host: "/var/run/postgresql",
    database: DB
  });

client.connect();


module.exports = client;
