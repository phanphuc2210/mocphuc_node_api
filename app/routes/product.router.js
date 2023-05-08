var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var productController = require('../controllers/product.controller')

router.get('/', productController.list)
router.get('/comment/:id', productController.getProductsNotComment)
router.get('/list/:slug', productController.listProductByType)
router.get('/ct/:slug', productController.detailCT)
router.get('/:id', productController.detail)

router.post('/', authMiddleware.isAuth, authMiddleware.checkAdmin, productController.add)
router.put('/:id', authMiddleware.isAuth, authMiddleware.checkAdmin,productController.update)
router.delete('/:id', authMiddleware.isAuth, authMiddleware.checkAdmin,productController.remove)



module.exports = router