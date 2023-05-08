var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var cartController = require('../controllers/cart.controller')

router.get('/:id',cartController.cartOfUser)
router.post('/',cartController.add)
router.post('/payment',cartController.payment)
router.delete('/remove/:userId/:productId',cartController.remove)
router.delete('/:userId',cartController.clear)
router.delete('/:userId/:productId',cartController.decrease)

module.exports = router