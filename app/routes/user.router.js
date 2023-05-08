var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var userController = require('../controllers/user.controller')

router.post('/forgot-password', userController.forgotPassword)
router.post('/reset-password', userController.resetPassword)
router.get('/', authMiddleware.isAuth,userController.list)
router.patch('/:id/change-password', authMiddleware.isAuth,userController.changePassword)
router.get('/:id', authMiddleware.isAuth,userController.detail)
router.put('/:id', authMiddleware.isAuth,userController.update)
router.delete('/:id', authMiddleware.isAuth,userController.remove)

module.exports = router