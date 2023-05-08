var Cart = require('../models/cart.model')

exports.cartOfUser = (req, res) => {
    const id = req.params.id
    Cart.getCartByUserId(id, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.add = (req, res) => {
    var data = req.body
    Cart.create(data, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.remove = (req, res) => {
    var userId = req.params.userId
    var productId = req.params.productId
    Cart.remove(userId, productId, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.decrease = (req, res) => {
    var userId = req.params.userId
    var productId = req.params.productId
    Cart.decrease(userId, productId, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.clear = (req, res) => {
    var userId = req.params.userId
    Cart.clear(userId, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.payment = (req, res) => {
    var data = req.body
    Cart.payment(data, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}


