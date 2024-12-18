const express = require("express");
const router = require("./routes/routes");
const client = require("./database/core");
const cookieParser = require("cookie-parser");
const { default: mongoose } = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;
console.log("NODE_ENV:", process.env.NODE_ENV);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? process.env.LOCAL
        : "http://159.203.135.38:8000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/", router);

app.enable("trust proxy");

app.get("/ping", (req, res) => {
  res.send("PONG! ALL SERVICES RUNNING!");
});

async function startServer() {
  try {
    await client.connect();
    const con = await mongoose.connect(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0-webdev.xsjxb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-webdev`
    );
    console.log(`MongoDB Connected: ${con.connection.host}`);

    app.listen(port, () => {
      console.log(`Server started listening at port: ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
