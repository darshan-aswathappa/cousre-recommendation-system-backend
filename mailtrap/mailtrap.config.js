const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "api",
    pass: "35aa0139acd8b4bd47a8ac848062e316",
  },
});

module.exports = transport;
