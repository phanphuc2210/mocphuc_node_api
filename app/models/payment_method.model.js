const db = require('../db/connect');

const PaymentMethod = (paymentMethod) => {
    this.id = paymentMethod.id;
    this.name = paymentMethod.name;
};

PaymentMethod.getAll = (result) => {
    let query = 'SELECT * FROM payment_method'
    db.query(query, (err, res) => {
        if (err) {
            result({ error: 'Lỗi khi truy vấn dữ liệu' });
        } else {
            result(res);
        }
    });
};

module.exports = PaymentMethod;
