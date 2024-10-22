const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGO_DB_URI;

const client = new MongoClient(uri);

module.exports = client;
