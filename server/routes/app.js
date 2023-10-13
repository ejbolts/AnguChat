// app.js
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017/TextVideoDB";
let db = null;
let client = null;

async function connect() {
  client = new MongoClient(url);
  try {
    await client.connect();
    db = client.db("TextVideoDB");
    console.log("Connected to database");
  } catch (e) {
    console.error(e);
  }
}

function close() {
  if (client) {
    client.close();
    console.log("Database connection closed");
  }
}

module.exports = {
  connect,
  db: () => db,
  close,
};
