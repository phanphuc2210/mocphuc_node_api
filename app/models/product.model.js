const db = require('../db/connect')
const slug = require('slug')

const Product = (product) => {
    this.id = product.id
    this.name = product.name
    this.typeId = product.typeId
    this.woodId = product.woodId
    this.quantity = product.quantity
    this.image = product.image
    this.price = product.price
    this.length = product.length
    this.width = product.width
    this.height = product.height
    this.description = product.description
    this.slug = product.slug
}

Product.getAll= (queryParams, result) => {
    let filters = []
    let filter_query = ''
    let limit = ''
    let order = ''
    let join = ''
    if(queryParams != null) {
        if(queryParams.name) {
            filters.push(`a.name LIKE '%${queryParams.name}%'`)
        }
        if(queryParams.typeId) {
            filters.push(`a.typeId = ${queryParams.typeId}`)
        }
        if(queryParams.woodId) {
            filters.push(`a.woodId = ${queryParams.woodId}`)
        }
        if(queryParams.gte) {
            filters.push(`a.price >= ${Number(queryParams.gte)}`)
        }
        if(queryParams.lte) {
            filters.push(`a.price <= ${Number(queryParams.lte)}`)
        }
        if(queryParams.limit) {
            limit = `LIMIT ${Number(queryParams.limit)}`
        } 
        if(queryParams.isNew) {
            order = ` ORDER BY a.id DESC `
        }
        if(queryParams.bestSeller) {
            join = ' JOIN `order_detail` AS od ON a.id = od.productId '
            order = ' ORDER BY COUNT(od.productId) DESC '
        }
    }

    if(filters.length > 0) {
        filter_query = 'WHERE ' + filters.join(' AND ')
    }
    
    let query = 'SELECT a.id, a.name, a.typeId, a.quantity, a.price, a.description, a.slug,b.name AS type_name, image.url as image, COUNT(c.userId) as amountComment, ROUND(AVG(c.star)) as starTotal '
    query += ' ,(SELECT COUNT(productId) FROM order_detail WHERE productId = a.id) AS sold '
    query += 'FROM product AS a JOIN type AS b ON a.typeId = b.id JOIN image ON a.id = image.productId LEFT JOIN comment AS c ON a.id = c.productId ' + join
    query += filter_query + ' GROUP by a.id ' + order + limit
    db.query(query , (err, res) => {
        if(err) {
            result({error: "Lỗi khi truy vấn dữ liệu"})
            console.log(err)
        } else {
            result(res)
        }
    })
}

Product.getByType = (slug, result) => {
    let condition = ''
    if(slug !== 'all') {
        condition = `WHERE b.slug='${slug}'`
    }
    let query = 'SELECT a.id, a.name, a.typeId, a.slug, a.quantity, a.price, a.description, b.name AS type_name, image.url as image, COUNT(c.userId) as amountComment, ROUND(AVG(c.star)) as starTotal, '
    query += ' (SELECT COUNT(productId) FROM order_detail WHERE productId = a.id) AS sold '
    query += 'FROM product AS a JOIN type AS b ON a.typeId = b.id JOIN image ON a.id = image.productId LEFT JOIN comment AS c ON a.id = c.productId '
    query += `${condition} GROUP by a.id `

    db.query(query, (err, res) => {
        if(err) {
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            result(res)
        }
    })
}

Product.getProductsNotComment = (id, result) => {
    let query = 'SELECT p.id, p.name, image.url as image '
    query += 'FROM `order_detail` AS od '
    query += 'RIGHT JOIN `order` AS o ON od.orderId = o.id '
    query += 'JOIN product AS p ON p.id = od.productId '
    query += 'JOIN image ON od.productId = image.productId '
    query += `WHERE o.userId = ${id} AND o.status = 4 AND od.productId NOT IN (SELECT productId FROM comment WHERE userId = ${id}) `
    query += 'GROUP BY od.productId;'

    db.query(query, (err, res) => {
        if(err) {
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            result(res)
        }
    })
}

Product.getById= (id, result) => {
    let query = 'SELECT a.id, a.name, a.typeId, a.woodId, a.quantity, a.price, a.length, a.width, a.height, a.description, b.name AS type_name, w.name AS wood  FROM product AS a JOIN type AS b ON a.typeId = b.id JOIN wood AS w ON a.woodId = w.id WHERE a.id = ?;'
    db.query(query, id, (err, res) => {
        if(err) {
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            if(res.length > 0) {
                let product = res[0]
                db.query('SELECT * FROM image WHERE productId = ?;', id, (err, res) => {
                    if(err) {
                        result({error: "Lỗi khi truy vấn dữ liệu"})
                    } else {
                        let image = []
                        res.forEach(i => {
                            image.push(i.url)
                        });
                        product.image = image
                        result(product)
                    }
                })
            } else {
                result({error: "Không tìm thấy dữ liệu"})
            }
        }
    })
}

Product.getBySlug= (slug, result) => {
    let query = 'SELECT a.id, a.name, a.typeId, a.woodId, a.quantity, a.price, a.length, a.width, a.height, a.description, b.name AS type_name, w.name AS wood, ' 
    query += ' (SELECT COUNT(productId) FROM order_detail WHERE productId = a.id) AS sold '
    query += ' FROM product AS a JOIN type AS b ON a.typeId = b.id JOIN wood AS w ON a.woodId = w.id WHERE a.slug = ?;'
    db.query(query, slug, (err, res) => {
        if(err) {
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            if(res.length > 0) {
                let product = res[0]
                db.query('SELECT * FROM image WHERE productId = ?;', product.id, (err, res) => {
                    if(err) {
                        result({error: "Lỗi khi truy vấn dữ liệu"})
                    } else {
                        let image = []
                        res.forEach(i => {
                            image.push(i.url)
                        });
                        product.image = image
                        result(product)
                    }
                })
            } else {
                result({error: "Không tìm thấy dữ liệu"})
            }
        }
    })
}

Product.create= (data, result) => {
    let productId
    let productQuery = "INSERT INTO `product` (`id`, `name`, `typeId`, `woodId`, `quantity`, `price`, `length`, `width`, `height` ,`description`, `slug`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    db.query(productQuery, [data.name, data.typeId, data.woodId, data.quantity, data.price, data.length, data.width, data.height, data.description, slug(data.name)], (err, res) => {
        if(err) {
            result({error: "Lỗi khi thêm mới dữ liệu"})
        } else {
            productId = res.insertId
            // Thêm ảnh cho sản phẩm
            images = data.image
            let imageQuery = "INSERT INTO `image` (`id`, `productId`, `url`) VALUES "
            let imageValueQuery = []
            images.forEach(url => {
                imageValueQuery.push(`(NULL, '${productId}', '${url}')`)
            })
            imageQuery += imageValueQuery.join(' , ')
            
            db.query(imageQuery, (err, res) => {
                if(err) {
                    result({error: "Lỗi khi thêm mới ảnh"})
                } else {
                    result({id: productId, ...data})
                }
            })
        }
    })
}

Product.update = (id, data, result) => {
    let query = `UPDATE product SET name=?,typeId=?, woodId=?,quantity=?, price=?, length=?,width=?,height=?,description=?,slug=?  WHERE id=?`
    db.query(query, [data.name, data.typeId, data.woodId,data.quantity, data.price, data.length, data.width, data.height,data.description, slug(data.name),id],
        (err, res) => {
            if(err) {
                result({error: "Lỗi khi cập nhật dữ liệu"})
            } else {
                // Xóa ảnh cũ
                db.query('DELETE FROM image WHERE productId = ?', id, (err, res) => {
                    if(err) {
                        result({error: "Lỗi khi xóa tất cả hình ảnh cũ"})
                    } else {
                        // Thêm ảnh mới cho sản phẩm
                        images = data.image
                        let imageQuery = "INSERT INTO `image` (`id`, `productId`, `url`) VALUES "
                        let imageValueQuery = []
                        images.forEach(url => {
                            imageValueQuery.push(`(NULL, '${id}', '${url}')`)
                        })
                        imageQuery += imageValueQuery.join(' , ')
                        
                        db.query(imageQuery, (err, res) => {
                            if(err) {
                                result({error: "Lỗi khi thêm mới ảnh"})
                            } else {
                                result({id, product: data})
                            }
                        })
                    }
                })
            }
        }
    )
}

Product.delete = (id, result) => {
    db.query('SELECT * FROM `order_detail` WHERE productId = ?', id, (err, res) => {
        if(err) {
            result({error: err.message})
        } else {
            if(res.length > 0) {
                result({error: 'Không thể xóa vì sản phẩm có mã #'+ id +' đã tồn tại trong hóa đơn'})
            } else {
                db.query(`DELETE FROM product WHERE id = ${id}` , (err, res) => {
                    if(err) {
                        result({error: "Lỗi khi xóa dữ liệu"})
                    } else {
                        // Xóa tất cả hình ảnh của sản phẩm
                        db.query('DELETE FROM image WHERE productId = ?', id, (err, res) => {
                            if(err) {
                                result({error: "Lỗi khi xóa hình ảnh của sản phẩm"})
                            } else {
                                result({id, message: "Xóa sản phẩm thành công"})
                            }
                        })
                    }
                })
            }
        }
    })
}


module.exports = Product