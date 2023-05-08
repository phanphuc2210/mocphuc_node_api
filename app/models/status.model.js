const db = require('../db/connect')

const Status = (status) => {
    this.id = status.id
    this.name = status.name
}

Status.getAll= (result) => {
    db.query('SELECT * FROM status' , (err, res) => {
        if(err) {
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            result(res)
        }
    })
}

// Status.getById= (id, result) => {
//     let query = 'SELECT * FROM wood WHERE id = ?;'
//     db.query(query, id, (err, res) => {
//         if(err) {
//             result({error: "Lỗi khi truy vấn dữ liệu"})
//         } else {
//             if(res.length > 0) {
//                 result(res[0])
//             } else {
//                 result({error: "Không tìm thấy dữ liệu"})
//             }
//         }
//     })
// }

module.exports = Status