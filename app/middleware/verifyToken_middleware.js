const asyncHandler = require('express-async-handler')
const isAdmin = asyncHandler((req, res, next) => {
    const { Permission } = req.user
    if (Permission !== 1)
        return res.status(401).json({
            success: false,
            message: 'Không có quyền truy cập'
        })
    next()
})

module.exports = {isAdmin}