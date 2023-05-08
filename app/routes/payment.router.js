var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var paymentController = require('../controllers/payment.controller')

router.post('/vnpay-payment', paymentController.vnpayPayment)
router.get('/vnpay-ipn', paymentController.vnpayIPN)
router.get('/vnpay_return', paymentController.vnpayReturn)

module.exports = router