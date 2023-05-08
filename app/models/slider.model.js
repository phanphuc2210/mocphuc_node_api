const db = require('../db/connect')

const Slider = (slider) => {
    this.id = slider.id
    this.image = slider.image
    this.linkto = slider.linkto
    this.description = slider.description
    this.active = slider.active
}

Slider.getAll= (isCustomer, result) => {
    let condition = ''
    if (isCustomer) {
        condition = 'WHERE active = 1'
    }
    db.query(`SELECT * FROM slider ${condition}` , (err, res) => {
        if(err) {
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            result(res)
        }
    })
}

Slider.getById= (id, result) => {
    let query = 'SELECT * FROM slider WHERE id = ?;'
    db.query(query, id, (err, res) => {
        if(err) {
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            if(res.length > 0) {
                result(res[0])
            } else {
                result({error: "Không tìm thấy dữ liệu"})
            }
        }
    })
}

Slider.create= (data, result) => {
    let query = "INSERT INTO `slider` (`id`, `image`, `linkto`,`description`, `active`) VALUES (NULL, ?, ?, ?, ?)"
    db.query(query, [data.image, data.linkto, data.description,data.active], (err, res) => {
        if(err) {
            result({error: "Lỗi khi thêm mới dữ liệu"})
        } else {
            result({id: res.insertId, ...data})
        }
    })
}

Slider.update = (id, data, result) => {
    let query = `UPDATE slider SET image=?, linkto=?, description=?, active=? WHERE id=?`
    db.query(query, [data.image, data.linkto, data.description,data.active, id],
        (err, res) => {
            if(err) {
                result({error: "Lỗi khi cập nhật dữ liệu"})
            } else {
                result({message: "Cập nhật slide thành công"})
            }
        }
    )
}

Slider.delete = (id, result) => {
    db.query('DELETE FROM slider WHERE id = ?', id, (err, res) => {
        if(err) {
            result({error: "Lỗi khi xóa dữ liệu"})
        } else {
            result({message: "Xóa slide thành công"})
        }
    })
}

module.exports = Slider