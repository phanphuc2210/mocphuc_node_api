const db = require('../db/connect')
const moment = require('moment');
const { statusCode } = require('../common/constant')

const Cart = (cart) => {
    this.id = cart.id
    this.userId = cart.userId
    this.productId = cart.productId
    this.price_product = cart.price_product
}

Cart.getCartByUserId= (id, result) => {
    let query = 'SELECT p.id, p.typeId, p.name, image.url as image, p.price, p.quantity, p.description '+
        'FROM cart JOIN product as p ON cart.productId = p.id JOIN image ON cart.productId = image.productId WHERE userId = ?;'
    db.query(query, id, (err, res) => {
        if(err) {
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            result(res)
        }
    })
}

Cart.create= (data, result) => {
    db.query("INSERT INTO cart SET ?", data, (err, res) => {
        if(err) {
            result({error: "Lỗi khi thêm mới dữ liệu"})
        } else {
            result({id: res.insertId, ...data})
        }
    })
}

Cart.decrease = (userId, productId, result) => {
    let query = 'DELETE FROM cart WHERE userId=? AND productId=? LIMIT 1';
    db.query(query, [userId, productId], (err, res) => {
        if(err) {
            result({error: "Lỗi khi xóa dữ liệu"})
        } else {
            result({userId, productId, message: `Giảm số lượng sản phẩm có ID ${productId} khỏi giỏ hàng thành công`})
        }
    })
}

Cart.remove = (userId, productId, result) => {
    let query = 'DELETE FROM cart WHERE userId=? AND productId=?';
    db.query(query, [userId, productId], (err, res) => {
        if(err) {
            result({error: "Lỗi khi xóa dữ liệu"})
        } else {
            result({userId, productId, message: `Xóa sản phẩm có ID ${productId} khỏi giỏ hàng thành công`})
        }
    })
}

Cart.clear = (userId, result) => {
    let query = 'DELETE FROM cart WHERE userId=?';
    db.query(query, userId, (err, res) => {
        if(err) {
            result({error: "Lỗi khi xóa toàn bộ giỏ hàng"})
        } else {
            result({userId, message: "Xóa thành công giỏ hàng"})
        }
    })
}

Cart.payment = (data, result) => {
    const order = data.order
    const orderDetails = data.order_details
    var date = new Date();
    let orderId = moment(date).format('MMDDHHmmss');
    let query_order = 'INSERT INTO `order` (`id`,`userId`, `order_date`, `customer_name`,`address`, `phone`, `email`,`payment_method`, `status`, `discount`, `code`) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
    let query_orderDetail = 'INSERT INTO `order_detail` (`orderId`, `productId`, `quantity_order`, `price_product`) VALUES (?,?,?,?)'
    let query_statusTrack = 'INSERT INTO `status_track` (`orderId`, `statusId`, `date`) VALUES (?,?,?)'
    db.query(query_order, [orderId,order.userId, getCurrentDate(), order.name, order.address, order.phone, order.email,order.payment_method, 1, order.discount, order.code] , (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi thêm mới 1 hóa đơn"})
        } else {
            db.query(query_statusTrack, [orderId, statusCode.Da_Dat_Hang, getCurrentDateTime()])
            orderDetails.forEach(o => {
                db.query(query_orderDetail, [orderId, o.productId, o.quantity, o.price], (err, res) => {
                    if(err) {
                        console.log(err)
                        result({error: "Lỗi khi thêm 1 chi tiết hóa đơn"})
                    } 
                })
            });
            db.query('UPDATE voucher SET quantity = quantity - 1 WHERE code = ?', order.code)
            result({orderId, message: "Đặt hàng thành công"})
        }
    })    
}

function getCurrentDate() {
    var date_ob = new Date();
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();

    var date = year + "-" + month + "-" + day;
    return date
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

module.exports = Cart