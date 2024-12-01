const express = require("express");
const router = require("./routes/routes");
const client = require("./database/core");
const cookieParser = require("cookie-parser");
const { default: mongoose } = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use(cookieParser());
app.use("/", router);

app.enable("trust proxy");

async function startServer() {
  try {
    await client.connect();
    const con = await mongoose.connect(process.env.MONGO_DB_URI);
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
