var Type = require('../models/type.model')

exports.list = (req, res) => {
    const queryParams = req.query
    Type.getAll(queryParams,(response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.detail = (req, res) => {
    const id = req.params.id
    Type.getById(id, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.listParent = (req, res) => {
    Type.getParent((response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.listChildren = (req, res) => {
    const parentId = req.params.parentId
    Type.getChildren(parentId,(response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.add = (req, res) => {
    var data = req.body
    Type.create(data, (response) => {
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
    Type.update(id, data,(response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}

exports.remove = (req, res) => {
    var id = req.params.id
    Type.delete(id, (response) => {
        if(response.error) {
            res.status(400).send({message: response.error})
        } else {
            res.send(response)
        }
    })
}