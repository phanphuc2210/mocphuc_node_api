var Status = require('../models/status.model')

exports.list = (req, res) => {
    Status.getAll((response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

// exports.detail = (req, res) => {
//     const id = req.params.id
//     Status.getById(id, (response) => {
//         if(response.error) {
//             res.status(400).send({message: response.error})
//         } else {
//             res.send(response)
//         }
//     })
// }
