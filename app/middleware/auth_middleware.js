const jsonwebtoken = require('jsonwebtoken');
const asyncHandler = require('express-async-handler')

const isAuthenticated = asyncHandler((req, res, next) => {
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
})


const isAdmin = asyncHandler((req, res, next) => {
    const { ent_chucvu } = req.user.data;

    if (ent_chucvu.Chucvu !== 'PSH' && ent_chucvu.Chucvu !== 'Giám đốc dự án' )
        return res.status(401).json({
            success: false,
            message: 'Không có quyền truy cập'
        })
    next()
})


module.exports = {isAuthenticated, isAdmin};