const db = require('../db/connect')
const config = require('../../config')
let crypto = require("crypto");  
const bcrypt = require('bcrypt');
const nodemailer =  require('nodemailer');

const User = (user) => {
    this.id = user.id
    this.firstName = user.firstName
    this.lastName = user.lastName
    this.avatar = user.avatar
    this.phone = user.phone
    this.address = user.address
    this.email = user.email
    this.password = user.password
    this.reset_token = user.reset_token
    this.reset_token_expires_at = user.reset_token_expires_at
    this.role = user.role
}

User.getUsers= (role, result) => {
    let query = 'SELECT * FROM user'
    if(role) {
        query += ` WHERE role = '${role}'`
    }
    db.query(query , (err, res) => {
        if(err) {
            result({error: "Lỗi khi truy vấn dữ liệu!"})
        } else {
            result(res)
        }
    })
}

User.getById= (id, result) => {
    let query = 'SELECT * FROM user WHERE id=?'
    db.query(query, id, (err, res) => {
        if(err) {
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            if(res[0]) {
                result(res[0])
            } else {
                result({error: "Không tìm thấy dữ liệu"})
            }
        }
    })
}

User.create= (data, result) => {
    db.query('SELECT * FROM user WHERE email = ?', data.email, (err, res) => {
        if (err) {
            result({error: "Xảy ra lỗi khi đăng ký tài khoản!"})
        } else {
            if (res.length > 0) {
                result({error: "Email đã được đăng ký!"})
            } else {
                db.query("INSERT INTO user SET ?", data, (err, res) => {
                    if(err) {
                        result({error: "Xảy ra lỗi khi đăng ký tài khoản!"})
                    } else {
                        result({id: res.insertId, ...data, message: "Đăng ký thành công!"})
                    }
                })
            }
        }
    })
}

User.update = (id, data,result) => {
    let query = `UPDATE user SET firstname=?, lastname=?, avatar=?, phone=?, address=?, email=?, password=?, role=?  WHERE id=?`
    db.query(query, [data.firstname, data.lastname, data.avatar, data.phone, data.address, data.email, data.password, data.role, id],
        (err, res) => {
            if(err) {
                result({error: "Lỗi khi cập nhật dữ liệu"}) 
            } else {
                result({message: "Thay đổi thông tin thành công"})
            }
    })
}

User.delete = (id, result) => {
    db.query(`DELETE FROM user WHERE id = ${id}` , (err, res) => {
        if(err) {
            result({error: "Lỗi khi xóa dữ liệu"})  
        } else {
            result({message: "Xóa user có id " + id + " thành công"})
        }
    })
}

User.check_login = (data, result) => {
    var {email, password} = data
    var query = 'SELECT * FROM user WHERE email=?'
    db.query(query, email,(err, res) => {
        if(err || res.length === 0) {
            result({error: "Email hoặc Password sai!"}) 
        } else {
            bcrypt.compare(password, res[0].password, function(err, response) {
                if(response) {
                    result(res[0])
                } else {
                    result({error: "Email hoặc Password sai!"}) 
                }
            });
        }
    })
}

User.changePassword = (id, data, result) => {
    var {oldPass, newPass} = data
    db.query('SELECT password FROM user WHERE id =?', id, (err, res) => {
        if(err || res.length === 0) {
            result({error: "Lỗi khi truy vấn dữ liệu"})
        } else {
            bcrypt.compare(oldPass, res[0].password, (err, response) => {
                if(err) {
                    console.log("bcrypt:", err)
                    result({error: "Lỗi khi so sánh dữ liệu"})
                } else {
                    if(response) {
                        db.query('UPDATE user SET password = ? WHERE id = ?', [newPass, id], (err, res) => {
                            if(err) {
                                result({error: "Lỗi khi cập nhật dữ liệu"})
                            } else {
                                result({message: "Đổi mật khẩu thành công", newPass})
                            }
                        })
                    } else {
                        result({error: "Mật khẩu cũ không đúng!"})
                    }
                }
            })
        }
    })
}

User.forgotPassword = (data, result) => {
    const email = data.email;
    const isAdmin = data.isAdmin;
    let url = '';
    if(isAdmin) {
        url = config.ADMIN_DOMAIN
    } else {
        url = config.CUSTOMER_DOMAIN
    }
    // kiểm tra email có tồn tại không
    db.query('SELECT * FROM user WHERE email = ?', [email], (err, res) => {
        if (res.length === 0) {
            result({error: 'Không tìm thấy người dùng!'})
        } else {
            // Generate a reset token and save it to the user's document in database
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
            db.query('UPDATE user SET reset_token = ?, reset_token_expires_at = ? WHERE email = ?', [resetToken, resetTokenExpiresAt || null, email]);
    
            // Send an email to the user with the reset link
            const resetLink = `http://${url}/reset-password?token=${resetToken}`;
            const emailBody = `Click on this link to reset your password: ${resetLink}`;
            sendEmail(email, 'Password reset', emailBody);
    
            // Return a success response
            result({ message: 'Reset email được gửi thành công. Vui lòng kiểm tra email!' });
        }
    })
}

User.resetPassword = (data, result) => {
    const newPassword = data.newPass;
    const resetToken = data.resetToken;

    let query = 'SELECT * FROM user WHERE reset_token = ? AND reset_token_expires_at > NOW()';
    let updateQuery = 'UPDATE user SET password = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE email = ?';

    db.query(query, [resetToken], (err, res) => {
        if(res.length === 0) {
            result({error: 'Reset token không hợp lệ!'})
        } else {
            // Update the user's password in database and remove the reset token
            const email = res[0].email;
            db.query(updateQuery, [newPassword, email], (err, res) => {
                if(err) {
                    result({error: 'Lỗi khi cập nhật dữ liệu!'})
                } else {
                    result({ message: 'Reset password thành công!!' });
                }
            });
        }
    });
}

function sendEmail(to, subject, body) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
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
  
    const mainOptions = { // thiết lập đối tượng, nội dung gửi mail
      from: '"MộcPhúc" <mocphuc2210@gmail.com>', // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: body, // plain text body
      html: `<p>${body}</p>`, // html body
    };

    transporter.sendMail(mainOptions, function(err, info){
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' +  info.response);
        }
    });
  }


module.exports = User