var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var voucherController = require('../controllers/voucher.controller')

router.get('/check-apply', voucherController.checkApply)
router.get('/user/:userId', voucherController.listByUser)
router.delete('/remove/:userId/:voucherId', voucherController.removeByUser)
router.get('/:id', voucherController.detail)
router.get('/', voucherController.list)

router.post('/save', authMiddleware.isAuth, voucherController.save)
router.post('/', authMiddleware.isAuth, authMiddleware.checkAdmin, voucherController.add)
router.put('/:id', authMiddleware.isAuth, authMiddleware.checkAdmin, voucherController.update)
router.delete('/:id', authMiddleware.isAuth, authMiddleware.checkAdmin,voucherController.remove)



module.exports = router