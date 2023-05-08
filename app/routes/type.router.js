var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var typeController = require('../controllers/type.controller')

router.get('/parent', typeController.listParent)
router.get('/children/:parentId', typeController.listChildren)
router.get('/:id', typeController.detail)
router.get('/', typeController.list)
router.post('/', authMiddleware.isAuth, authMiddleware.checkAdmin, typeController.add)
router.put('/:id', authMiddleware.isAuth, authMiddleware.checkAdmin, typeController.update)
router.delete('/:id', authMiddleware.isAuth, authMiddleware.checkAdmin,typeController.remove)

module.exports = router