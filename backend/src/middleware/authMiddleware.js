var jwt = require("jsonwebtoken");

var authMiddleware = function (req, res, next) {
  var authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  // 🔥 REMOVE "Bearer "
  var token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    var decoded = jwt.verify(token, "secretkey");
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

var checkRole = function (roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { authMiddleware: authMiddleware, checkRole: checkRole };