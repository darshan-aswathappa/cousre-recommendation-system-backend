const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: "137.184.214.177",
    path: "/",
  });

  return token;
};

module.exports = generateTokenAndSetCookie;
