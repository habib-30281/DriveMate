const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(403).send({ message: "Token is required" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.id) {
      req.user = decoded;
      next();
    } else {
      throw new Error("JWT does not contain required 'id'");
    }
  } catch (error) {
    res.status(401).send({ message: "Invalid Token" });
  }
};

module.exports = verifyToken;
