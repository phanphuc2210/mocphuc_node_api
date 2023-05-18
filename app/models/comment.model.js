const db = require('../db/connect')

const Comment = (comment) => {
    this.userId = comment.userId
    this.productId = comment.productId
    this.userName = comment.userName
    this.message = comment.message
    this.image = comment.image
    this.time = comment.time
    this.star = comment.star
}

Comment.getAllByProductId= (productId, result) => {
    db.query('SELECT c.userId, c.productId, c.message, c.image,c.time, c.star, CONCAT(u.lastname, " ",u.firstname) as username, u.avatar FROM comment as c JOIN user as u ON c.userId = u.id WHERE productId = ?', productId, (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            result(res)
        }
    })
}

Comment.getAll = (result) => {
    let query = 'SELECT c.message, c.image, c.star, CONCAT(u.lastname, " ",u.firstname) as username, image.url as image_product, p.slug '
    query += 'FROM comment as c JOIN user as u ON c.userId = u.id '
    query += 'JOIN image ON c.productId = image.productId JOIN product AS p ON p.id = c.productId '
    query += 'GROUP BY c.userId, c.productId'
    db.query(query, (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            result(res)
        }
    })
}

Comment.getSingleComment= (userId, productId, result) => {
    db.query('SELECT * FROM comment WHERE userId = ? AND productId = ?', [userId, productId], (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            if(res.length > 0) {
                result(res[0])
            } else {
                result({error: "Comment không tồn tại"})
            }
        }
    })
}

Comment.create = (data, result) => {
    let query = 'INSERT INTO comment (`userId`, `productId`, `message`, `image`, `time`, `star`) VALUES (?,?,?,?,?,?)'
    let current = getCurrentDateTime()
    db.query(query, [data.userId, data.productId, data.message, data.image,current, data.star], (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi thêm mới comment"})
        } else {
            result({...data, time: current})
        }
    })
}

Comment.update = (data, result) => {
    let query = "UPDATE comment SET message=?,image=?,time=?,star=? WHERE userId = ? AND productId = ?"
    let current = getCurrentDateTime()
    db.query(query, [data.message, data.image, current, data.star, data.userId, data.productId], (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi sửa comment"})
        } else {
            result({...data, time: current})
        }
    })
}

Comment.analysis = (queryParams, result) => {
    let conditions = []
    let condition_query = ''

    if(queryParams != null) {
        if(queryParams.from) {
            conditions.push(`c.time >= '${queryParams.from}'`)
        }
        if(queryParams.to) {
            conditions.push(`c.time <= '${queryParams.to}'`)
        }
        if(queryParams.typeId) {
            conditions.push(`p.typeId = ${queryParams.typeId}`)
        }
        if(queryParams.woodId) {
            conditions.push(`p.woodId = ${queryParams.woodId}`)
        }
    }
    
    if(conditions.length > 0) {
        condition_query = 'WHERE ' + conditions.join(' AND ')
    }

    let quantity_star = {
        "one_star": 0,
        "two_star": 0,
        "three_star": 0,
        "four_star": 0,
        "five_star": 0
    }

    let queryStar = 'SELECT star, COUNT(star) AS quantity '
    queryStar += ' FROM comment AS c JOIN product AS p ON c.productId = p.id '
    queryStar += condition_query + ' GROUP BY star'
    db.query(queryStar, (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi sửa comment"})
        } else {
            if(res.length > 0) {
                res.forEach(val => {
                    if(val.star === 1) {
                        quantity_star['one_star'] = val.quantity
                    } else if(val.star === 2) {
                        quantity_star['two_star'] = val.quantity
                    } else if(val.star === 3) {
                        quantity_star['three_star'] = val.quantity
                    } else if(val.star === 4) {
                        quantity_star['four_star'] = val.quantity
                    } else if(val.star === 5) {
                        quantity_star['five_star'] = val.quantity
                    }
                })
            }

            result(quantity_star)
        }
    })
}

function getCurrentDateTime() {
    var date_ob = new Date();
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();
    var hour = date_ob.getHours();
    var minute = date_ob.getMinutes();
    var second = date_ob.getSeconds();

    var datetime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    return datetime
}


module.exports = Comment