const jwt = require('jsonwebtoken')
const config = require('../../config')

// make => tạo mã token
let make = (user) => {
    return new Promise((resolve, reject) => {
        jwt.sign({data: user}, config.KEY_SECRET, {
            algorithm: "HS256",
            expiresIn: config.TOKEN_TIME_LIFE
        }, (err, token) => {
            if(err) {
                return reject(err)
            }
            return resolve(token)
        })
    })
}

// check => xác thực mã đúng, sai, hết hạn
let check = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.KEY_SECRET, (err, data) => {
            if(err) {
                return reject(err)
            }
            return resolve(data)
        })
    })
}

module.exports = {
    make,
    check,
}