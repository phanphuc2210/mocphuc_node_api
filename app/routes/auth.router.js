var express = require('express')
var router = express.Router()
var userController = require('../controllers/user.controller')

router.post('/register', userController.add)
router.post('/login', userController.login)


module.exports = router