const express = require("express");
const router = require("./routes/routes");
const client = require("./database/core");

const app = express();
const port = 5000;
const host = "localhost";

app.use(express.json());
app.use("/", router);

async function startServer() {
  try {
    await client.connect();
    await client.db("courses").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");

    app.listen(port, host, () => {
      console.log(`Server started listening at http://${host}:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
