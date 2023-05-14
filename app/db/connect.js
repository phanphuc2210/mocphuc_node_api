var mysql = require('mysql')

// var connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'mocphuc_api_ng'
// })

var connection = mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12618206',
    password: '6cdCD4W8JK',
    database: 'sql12618206',
    port: 3306
})

connection.connect((err) => {
    if(err) {
        console.log(err)
        console.log("Kết nối CSDL không thành công")
    }
})

module.exports = connection