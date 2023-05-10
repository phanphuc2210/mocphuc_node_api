const db = require('../db/connect')
const { statusCode, paymentMethod } = require('../common/constant')
const nodemailer =  require('nodemailer');

const Invoice = (invoice) => {
    this.id = invoice.id
    this.date = invoice.date
    this.address = invoice.address
    this.phone = invoice.phone
    this.email = invoice.email
    this.payment_method = invoice.payment_method
    this.discount = invoice.discount
    this.code = invoice.code
}

Invoice.getInvoiceByOrderId = (orderId, result) => {
    let invoice = {}
    const query_order = 'SELECT o.id, o.order_date, o.customer_name ,o.address, o.phone, o.email,m.name AS payment_method, s.name AS status_name, o.status, o.discount'+
        ' FROM `order` as o JOIN `status` as s ON o.status = s.id JOIN `payment_method` as m ON o.payment_method = m.id'+
        ' WHERE o.id = ?'
    const query_orderDetail = 'SELECT * FROM `order_detail` as o JOIN `product` as p ON o.productId = p.id JOIN image ON o.productId = image.productId WHERE orderId = ? GROUP by p.id'
    db.query(query_order, orderId, (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            invoice.order = {
                id: res[0].id,
                name: res[0].customer_name,
                phone: res[0].phone,
                email: res[0].email,
                address: res[0].address,
                order_date: res[0].order_date,
                payment_method: res[0].payment_method,
                status: res[0].status,
                status_name: res[0].status_name,
                discount: res[0].discount
            }
            db.query(query_orderDetail, orderId, (err, res) => {
                if(err) {
                    console.log(err)
                    result({error: "Lỗi khi truy vấn dữ liệu"})
                } else {
                    let orderDetails = []
                    res.forEach(o => {
                        orderDetails.push({
                            productId: o.productId,
                            name: o.name,
                            image: o.url,
                            price: o.price_product,
                            quantity: o.quantity_order
                        })
                    })
                    invoice.order_details = orderDetails
                    result(invoice)
                }
            })
        }
    })
}

Invoice.getInvoiceList = (userId, queryParams, result) => {
    let queryStr = ''

    let filters = []
    let filter_query = ''
    let limit = ''
    if(queryParams != null) {
        if(queryParams.from) {
            filters.push(`o.order_date >= '${queryParams.from}'`)
        }

        if(queryParams.to) {
            filters.push(`o.order_date <= '${queryParams.to}'`)
        }
        if(queryParams.payment) {
            filters.push(`o.payment_method = ${queryParams.payment}`)
        }

        if(queryParams.status) {
            filters.push(`o.status = ${queryParams.status}`)
        }
        
        if(queryParams.limit) {
            limit = `LIMIT ${Number(queryParams.limit)}`
        }
    }
    
    if (userId != 0) {
        filter_query = 'WHERE userId = ?'
        if(filters.length > 0) {
            filter_query += 'AND ' + filters.join(' AND ')
        }
    } else {
        if(filters.length > 0) {
            filter_query = 'WHERE ' + filters.join(' AND ')
        }
    }
    queryStr = 'SELECT o.id,o.order_date,o.address,o.phone,m.name AS payment_method,s.name AS status_name, o.status FROM `order` AS o JOIN `status` AS s ON o.status = s.id JOIN `payment_method` as m ON o.payment_method = m.id '+ filter_query +' ORDER BY id DESC'
    
    db.query(queryStr, userId, (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            result(res)
        }
    })
}

Invoice.getNextStatusByOrderId = (orderId, result) => {
    let currentStatus
    let isShowCancelBtn = false;
    db.query('SELECT status, payment_method FROM `order` WHERE id = ?', orderId, (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            if(res.length > 0) {
                currentStatus = res[0].status
                if(res[0].payment_method !== paymentMethod.VNPAY && currentStatus === statusCode.Da_Dat_Hang) {
                    isShowCancelBtn = true
                }
                db.query('SELECT * FROM status WHERE id = ?', currentStatus + 1, (err, res) => {
                    if(err) {
                        console.log(err)
                        result({error: "Lỗi khi truy vấn dữ liệu"})
                    } else {
                        if(res.length > 0) {
                            result({orderId, statusId: res[0].id, nextStatus: res[0].name, isShowCancelBtn})
                        } else {
                            result({orderId, statusId: 5, nextStatus: 'Hoàn thành', isShowCancelBtn})
                        }
                    }
                })
            } else {
                result({error: "Không tìm thấy dữ liệu"})
            }
        }
    })
}

Invoice.getListStatusByOrderId = (orderId, result) => {
    let query = 'SELECT s.name AS status_name, st.date FROM status_track AS st JOIN status AS s ON st.statusId = s.id WHERE orderId = ?'
    db.query(query, orderId, (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            result(res)
        }
    })
}

Invoice.updateStatus = (data, result) => {
    let query_statusTrack = 'INSERT INTO `status_track` (`orderId`, `statusId`, `date`) VALUES (?,?,?)'
    db.query('UPDATE `order` SET status = ? WHERE id = ?', [data.nextStatus, data.orderId], (err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi cập nhật trạng thái mới"})
        } else {
            db.query(query_statusTrack, [data.orderId, data.nextStatus, getCurrentDateTime()], (err, res) => {
                if(err) {
                    console.log(err)
                    result({error: "Lỗi khi cập nhật status tracking"})
                } else {
                    result({message: "Cập nhật trạng thái mới thành công"})
                }
            })
        }
    })
}

Invoice.getStatis = (queryParams, result) => {
    let conditions = []
    let condition_query = ''

    if(queryParams != null) {
        if(queryParams.from) {
            conditions.push(`o.order_date >= '${queryParams.from}'`)
        }
        if(queryParams.to) {
            conditions.push(`o.order_date <= '${queryParams.to}'`)
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

    let query = 'SELECT d.productId, SUM(d.quantity_order) as quantity '
    query += ' FROM `order` as o JOIN `order_detail` as d ON o.id = d.orderId JOIN product as p ON d.productId = p.id ' 
    query += condition_query + ' GROUP BY d.productId ORDER BY d.productId'

    db.query(query,(err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            result(res)
        }
    })
}

Invoice.analysis = (queryParams, result) => {
    let from = queryParams.from
    let to = queryParams.to

    let quantityCustomer = 0
    let quantityProduct = 0
    let quantityOrder = 0

    let query = 'SELECT * FROM order_detail AS od '
    query += 'JOIN `order` AS o ON od.orderId = o.id '
    query += 'WHERE o.order_date >= ? AND o.order_date <= ? '
    query += 'GROUP BY o.email'

    let queryTotalProduct = 'SELECT od.productId, SUM(od.quantity_order) as quantity '
    queryTotalProduct += 'FROM order_detail AS od JOIN `order` AS o ON od.orderId = o.id '
    queryTotalProduct += 'WHERE o.order_date >= ? AND o.order_date <= ? '
    queryTotalProduct += 'GROUP BY od.productId;'

    db.query(query,[from, to],(err, res) => {
        if(err) {
            console.log(err)
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            quantityCustomer = res.length
            db.query(queryTotalProduct, [from, to], (err, res) => {
                if(err) {
                    console.log(err)
                    result({error: "Lỗi khi truy vấn dữ liệu"})
                } else {
                    if (res.length > 0) {
                        res.forEach(val => {
                            quantityProduct += val.quantity
                        })
                    }

                    db.query('SELECT * FROM `order` WHERE order_date >= ? AND order_date <= ?', [from, to], (err, res) => {
                        if(err) {
                            console.log(err)
                            result({error: "Lỗi khi truy vấn dữ liệu"})
                        } else {
                            quantityOrder = res.length
                            result({customers: quantityCustomer, products: quantityProduct, orders: quantityOrder})
                        }
                    })
                }
            })
        }
    })
}

Invoice.sendMail = (data, result) => {
    const order = data.order
    const orderDetails = data.order_details
    const subject = data.subject
    const transporter =  nodemailer.createTransport({ // config mail server
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'mocphuc2210@gmail.com', 
            pass: 'oikfxuwevzikbdnc'
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
    let rowProduct = ''
    let total_price = 0
    orderDetails.forEach(d => {
        total_price += d.price * d.quantity
        rowProduct += `
            <tr style="background-color:white;border-bottom-width: 1px;color: rgb(17,24,39)">
                <th scope="row" style="padding: 16px 24px">
                    <img style="width:64px; margin: 0 auto" class="w-16 mx-auto" src="${d.image}">
                </th>
                <td style="padding: 16px 24px">
                    ${d.name}
                </td>
                <td style="padding: 16px 24px">
                    ${new Intl.NumberFormat('it-IT', {style : 'currency', currency : 'vnd'}).format(d.price)}
                </td>
                <td style="padding: 16px 24px">
                    ${d.quantity}
                </td>
                <td style="padding: 16px 24px">
                    ${new Intl.NumberFormat('it-IT', {style : 'currency', currency : 'vnd'}).format(d.price * d.quantity) }
                </td>
            </tr>
        `
    })
    let content = `
            <h1>MộcPhúc.</h1>
            <div style="margin-top: 12px; background-color: white">
                <h2 style="margin-bottom: 8px;">Chi tiết hóa đơn #${order.id}</h2>
                <hr>
                <div style="display: flex;">
                    <div>
                        <p style="margin: 12px 0;font-weight: 700;">Tên khách hàng: <span style="font-weight: 400;">${order.name}</span></p>
                        <p style="margin: 12px 0;font-weight: 700;">Số điện thoại: <span style="font-weight: 400;">${order.phone}</span></p>
                        <p style="margin: 12px 0;font-weight: 700;">Nơi nhận: <span style="font-weight: 400;">${order.address}</span></p>
                    </div>
                    <div style="margin-left: 28px">
                        <p style="margin: 12px 0;font-weight: 700;">Ngày đặt hàng: <span style="font-weight: 400;">${getCurrentDate()}</span></p>
                        <p style="margin: 12px 0;font-weight: 700;">Phương thức thanh toán: <span style="font-weight: 400;">${order.payment_method}</span></p>
                    </div>
                </div>
    
                <table style="width: 100%; text-align: center; color: rgb(107,114,128); margin-top: 20px">
                    <thead style="color: rgb(55,65,81);background-color: rgb(249,250,251)">
                        <tr>
                            <th scope="col" style="padding: 12px 24px;">
                                Hình ảnh
                            </th>
                            <th scope="col" style="padding: 12px 24px;">
                                Tên sản phẩm
                            </th>
                            <th scope="col" style="padding: 12px 24px;">
                                Đơn giá
                            </th>
                            <th scope="col" style="padding: 12px 24px;">
                                Số lượng
                            </th>
                            <th scope="col" style="padding: 12px 24px;">
                                Thành tiền
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowProduct}
                    </tbody>
                </table>
                <h4 style="color:#000; margin-top:24px; text-align: right;">Tổng tiền sản phẩm: <span style="color: rgb(224,36,36);">${new Intl.NumberFormat('it-IT', {style : 'currency', currency : 'vnd'}).format(total_price)}</span></h4>
                <h4 style="color:#000; margin-top:12px; text-align: right;">Tổng tiền được giảm: <span style="color: rgb(224,36,36);">${new Intl.NumberFormat('it-IT', {style : 'currency', currency : 'vnd'}).format(order.discount)}</span></h4>
                <h4 style="color:#000; margin-top:12px; text-align: right;">Tổng tiền phải thanh toán: <span style="color: rgb(224,36,36);">${new Intl.NumberFormat('it-IT', {style : 'currency', currency : 'vnd'}).format(total_price - order.discount)}</span></h4>
            </div>
    `;
    
    const mainOptions = { // thiết lập đối tượng, nội dung gửi mail
        from: 'MocPhuc',
        to: order.email,
        subject: subject,
        text: 'Your text is here',//Thường thi mình không dùng cái này thay vào đó mình sử dụng html để dễ edit hơn
        html: content //Nội dung html mình đã tạo trên kia :))
    }
    transporter.sendMail(mainOptions, function(err, info){
        if (err) {
            console.log(err);
            result({error: 'Lỗi gửi mail: '+err}) //Gửi thông báo đến người dùng
        } else {
            console.log('Message sent: ' +  info.response);
            result({message: 'Một email đã được gửi đến tài khoản của bạn'}) //Gửi thông báo đến người dùng
        }
    });
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

module.exports = Invoice