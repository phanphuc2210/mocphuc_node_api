var Voucher = require('../models/voucher.model')

exports.list = (req, res) => {
    const userId = req.query.userId? req.query.userId : null
    Voucher.getAll(userId, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.listByUser = (req, res) => {
    const userId = req.params.userId
    Voucher.getAllByUser(userId, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.detail = (req, res) => {
    const id = req.params.id
    Voucher.getById(id, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.checkApply = (req, res) => {
    const queryParams = req.query
    Voucher.checkApply(queryParams, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.add = (req, res) => {
    var data = req.body
    Voucher.create(data, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.save = (req, res) => {
    var data = req.body
    Voucher.saveVoucher(data, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.update = (req, res) => {
    var id = req.params.id
    var data = req.body
    Voucher.update(id, data,(response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.remove = (req, res) => {
    var id = req.params.id
    Voucher.delete(id, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.removeByUser = (req, res) => {
    var userId = req.params.userId
    var voucherId = req.params.voucherId
    Voucher.removeByUser(userId, voucherId,(response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}
