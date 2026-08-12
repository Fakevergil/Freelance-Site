const jwt = require("jsonwebtoken");

function authMiddleWare(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    res.status(401).send("No Token Provided");
    return;
  }
  const token = header.split(" ");

  try {
    const decoded = jwt.verify(token[1], process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401, "Invalid Token").send("Invalid Token");
  }
}

module.exports = authMiddleWare;
