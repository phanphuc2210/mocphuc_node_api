const db = require('../db/connect')
const config = require('../../config')
const { statusCode } = require('../common/constant')
var Invoice = require('../models/invoice.model')
const moment = require('moment');

exports.vnpayPayment = (req, res, next) => {
    const order = req.body.order
    const orderDetails = req.body.order_details

    var ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var tmnCode = config.TMN_CODE;
    var secretKey = config.VNPAY_SECRET_KEY;
    var vnpUrl = config.VNPAY_URL;
    var returnUrl = `${config.CUSTOMER_DOMAIN}/success`;

    var date = new Date();
    
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let orderId = moment(date).format('MMDDHHmmss');
    var amount = order.amount;
    var bankCode = "";

    var orderInfo = "Thanh toán đơn hàng test";
    var orderType = "billpayment";
    var locale = "vn";
    
    var currCode = 'VND';
    var vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let querystring = require('qs');
    var signData = querystring.stringify(vnp_Params, { encode: false }); 
    let crypto = require("crypto");    
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    // res.redirect(vnpUrl)
    res.send({url: vnpUrl})
}

exports.vnpayIPN = (req, res, next) => {
    var vnp_Params = req.query;
    var secureHash = vnp_Params['vnp_SecureHash'];

    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    var secretKey = config.VNPAY_SECRET_KEY;
    var querystring = require('qs');
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");     
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    if(secureHash === signed){
        if(rspCode=="00") {
            res.send({rspCode: '00', orderId,message: 'Thanh toán thành công!'})
        } else {
            Invoice.updateStatus({nextStatus: statusCode.Thanh_Toan_That_Bai, orderId}, (response) => {
                if(response.error) {
                    res.status(400).send({message: response.error})
                } else {
                    res.send({rspCode: rspCode, orderId,message: 'Thanh toán thất bại!'})
                }
            })
        }
    }
    else {
        res.send({rspCode: '97', message: 'Fail checksum'})
    }
}

exports.vnpayReturn = (req, res, next) => {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = config.TMN_CODE;
    let secretKey = config.VNPAY_SECRET_KEY;

    let signData = querystring.stringify(vnp_Params, { encode: false });   
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     

    if(secureHash === signed){
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

        res.send({code: vnp_Params['vnp_ResponseCode']})
    } else{
        res.send({code: '97'})
    }
}

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
