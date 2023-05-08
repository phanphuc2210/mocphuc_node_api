var PaymentMethod = require('../models/payment_method.model')

exports.list = (req, res) => {
    PaymentMethod.getAll((response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}
