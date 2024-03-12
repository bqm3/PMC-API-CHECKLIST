const jsonwebtoken = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
  // const token = req.cookies.token;
  const tokenFromClient =
  req.body.token || req.query.token || req.headers["authorization"];

  if (!tokenFromClient) {
    return res.status(401).json({ message: 'Chưa cung cấp token' });
  }

  const bearerToken = tokenFromClient.split(" ")[1];
  jsonwebtoken.verify(bearerToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: `Token không hợp lệ ${err}` });
    }

    req.user = user;
    next();
  });
}

module.exports = isAuthenticated;