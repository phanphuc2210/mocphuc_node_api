var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var invoiceController = require('../controllers/invoice.controller')

router.get('/analysis', invoiceController.analysis)
router.get('/statistical', authMiddleware.isAuth, authMiddleware.checkAdmin,invoiceController.statistical)
router.get('/next-status/:orderId', invoiceController.nextStatus)
router.get('/status/:orderId', invoiceController.status)
router.patch('/update-status', invoiceController.updateStatus)
router.post('/send-mail', authMiddleware.isAuth, authMiddleware.checkAdmin,invoiceController.sendMail)
router.get('/:orderId',invoiceController.invoice)
router.get('/list/:userId',authMiddleware.isAuth,invoiceController.invoiceList)

module.exports = router