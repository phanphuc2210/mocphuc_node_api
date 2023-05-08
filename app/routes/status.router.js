var express = require('express')
var router = express.Router()
var authMiddleware = require('../common/authMiddleWare')
var statusController = require('../controllers/status.controller')

router.get('', statusController.list)
// router.get('/:id', statusController.detail)

module.exports = router