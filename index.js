const express = require("express");
const router = require("./routes/routes");

const app = express();
const port = 5000;
const host = "localhost";

app.use("/", router);

app.listen(port, host, () => {
  console.log(`Server started listening at ${host} on port ${port}.`);
});
