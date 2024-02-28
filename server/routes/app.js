// app.js
let db = "TextVideoDB";
const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const uri = process.env.MONGODB_URI


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connect() {
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
