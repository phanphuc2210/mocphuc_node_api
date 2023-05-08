var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var sliderController = require('../controllers/slider.controller')

router.get('/', sliderController.list)
router.get('/:id', authMiddleware.isAuth, authMiddleware.checkAdmin, sliderController.detail)
router.post('/', authMiddleware.isAuth, authMiddleware.checkAdmin, sliderController.add)
router.put('/:id', authMiddleware.isAuth, authMiddleware.checkAdmin, sliderController.update)
router.delete('/:id', authMiddleware.isAuth, authMiddleware.checkAdmin,sliderController.remove)

module.exports = router