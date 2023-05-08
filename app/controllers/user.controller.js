var User = require('../models/user.model')
var jwt = require('../common/_jwt')
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.list = (req, res) => {
    const role = req.query.role? req.query.role : null
    User.getUsers(role, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.detail = (req, res) => {
    const id = req.params.id
    User.getById(id, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.add = (req, res) => {
    var data = req.body
    let encryptedPassword = ''

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(data.password, salt, function(err, hash) {
            encryptedPassword = hash
            data = {
                ...data,
                password: encryptedPassword
            }

            User.create(data, (response) => {
                if(response.error) {
                    res.status(400).send({message: response.error})
                } else {
                    res.send(response)
                }
            })
        });
    });
}

exports.update = (req, res) => {
    var id = req.params.id
    var data = req.body
    User.update(id, data,(response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.remove = (req, res) => {
    var id = req.params.id
    User.delete(id, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.login = (req, res) => {
    var data = req.body
    User.check_login(data, async (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            const payload = {id: response.id, firstname: response.firstname, avatar: response.avatar, role: response.role}
            const token = await jwt.make(payload)
            res.send({token, data: payload, message: "Đăng nhập thành công"})
        }
    })
}

exports.changePassword = (req, res) => {
    var id = req.params.id
    var data = req.body
    let encryptedPassword = ''

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(data.newPass, salt, function(err, hash) {
            encryptedPassword = hash
            data = {
                ...data,
                newPass: encryptedPassword
            }

            User.changePassword(id, data, (response) => {
                if(response.error) {
                    res.status(400).send({message: response.error})
                } else {
                    res.send(response)
                }
            })
        });
    });
}

exports.forgotPassword = async (req, res) => {
    let data = req.body;
    User.forgotPassword(data, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.resetPassword = (req, res) => {
    let data = req.body;
    let encryptedPassword = ''

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(data.newPass, salt, function(err, hash) {
            encryptedPassword = hash
            data = {
                ...data,
                newPass: encryptedPassword
            }

            User.resetPassword(data, (response) => {
                if(response.error) {
                    res.status(400).send({message: response.error})
                } else {
                    res.send(response)
                }
            })
        });
    });
}
