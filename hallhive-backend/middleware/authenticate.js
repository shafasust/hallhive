const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'hallhive_secret';

function authenticate(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });
    try {
      const token = authHeader.replace(/^Bearer\s*/, "");
      const payload = jwt.verify(token, JWT_SECRET);
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = payload;
      next();
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}
module.exports = authenticate;