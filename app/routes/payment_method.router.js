var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var paymentMethodController = require('../controllers/payment_method.controller')

router.get('/', paymentMethodController.list)

module.exports = router