const express = require("express");
const router = require("./routes/routes");
const client = require("./database/core");
const cookieParser = require("cookie-parser");
const { default: mongoose } = require("mongoose");

const app = express();
const port = 5000;
const host = "localhost";

app.use(express.json());
app.use(cookieParser());
app.use("/", router);

async function startServer() {
  try {
    await client.connect();
    const con = await mongoose.connect(process.env.MONGO_DB_URI);
    console.log(`MongoDB Connected: ${con.connection.host}`);

    app.listen(port, host, () => {
      console.log(`Server started listening at http://${host}:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
