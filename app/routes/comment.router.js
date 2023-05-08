var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var commentController = require('../controllers/comment.controller')

router.get('/analysis', commentController.analysis)
router.get('/:userId/:productId', commentController.detail)
router.get('/:productId', commentController.list)
router.get('/', commentController.all)
router.post('/', authMiddleware.isAuth, commentController.add)
router.put('/', commentController.update)


module.exports = router