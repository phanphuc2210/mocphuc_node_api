var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var woodController = require('../controllers/wood.controller')

router.get('/', woodController.list)
router.get('/:id',woodController.detail)

router.post('/', authMiddleware.isAuth, authMiddleware.checkAdmin, woodController.add)
router.put('/:id', authMiddleware.isAuth, authMiddleware.checkAdmin, woodController.update)
router.delete('/:id', authMiddleware.isAuth, authMiddleware.checkAdmin,woodController.remove)



module.exports = router