const { MongoClient } = require("mongodb");

const client = new MongoClient(
  `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0-webdev.xsjxb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-webdev`
);

module.exports = client;
