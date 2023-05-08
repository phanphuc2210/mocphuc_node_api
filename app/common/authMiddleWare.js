let isAuth = async (req, res, next) => {
    var _jwt = require('./_jwt')
    let authorization = req.headers.authorization
    if(authorization) {
        let [scheme, token] = authorization.split(' ')
        try {
            var authData = await _jwt.check(token)
            req.auth = authData.data
            next()
        } catch (error) {
            return res.status(400).send({message: "Mã token không hợp lệ"})
        }
    } else {
        return res.status(403).json({message: "Chưa đăng nhập"})
    }
}

let checkAdmin = (req, res, next) => {
    var role = req.auth.role
    if(role === 'Admin') {
        next()
    } else {
        return res.status(403).send({message: "Không có quyền"})
    }
}

module.exports = {
    isAuth,
    checkAdmin
}