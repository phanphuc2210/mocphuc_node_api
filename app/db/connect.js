var mysql = require('mysql')

// var connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'mocphuc_api_ng'
// })

var connection = mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12616606',
    password: 'fKhWHyqbTx',
    database: 'sql12616606',
    port: 3306
})

connection.connect((err) => {
    if(err) {
        console.log(err)
        console.log("Kết nối CSDL không thành công")
    }
})

module.exports = connection