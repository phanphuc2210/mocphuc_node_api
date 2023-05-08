const express = require('express')
var cors = require('cors')
const app = express()
const imgur = require('imgur')
const fs = require('fs')
const fileUpload = require('express-fileupload')


app.use(cors());
app.use(fileUpload())

// Cau hinh body-parser
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


var authMiddleware = require('./app/common/authMiddleWare')
// Cac routers
var typeRouter = require('./app/routes/type.router')
var woodRouter = require('./app/routes/wood.router')
var sliderRouter = require('./app/routes/slider.router')
var productRouter = require('./app/routes/product.router')
var voucherRouter = require('./app/routes/voucher.router')
var commentRouter = require('./app/routes/comment.router')
var cartRouter = require('./app/routes/cart.router')
var paymentRouter = require('./app/routes/payment.router')
var invoiceRouter = require('./app/routes/invoice.router')
var userRouter = require('./app/routes/user.router')
var authRouter = require('./app/routes/auth.router')
var statusRouter = require('./app/routes/status.router')
var paymentMethodRouter = require('./app/routes/payment_method.router')

app.use('/auth', authRouter)
app.use('/types', typeRouter)
app.use('/woods', woodRouter)
app.use('/slider', sliderRouter)
app.use('/products', productRouter)
app.use('/voucher', voucherRouter)
app.use('/comments', commentRouter)
app.use('/cart',cartRouter)
app.use('/payment',paymentRouter)
app.use('/invoice',invoiceRouter)
app.use('/users', userRouter)
app.use('/status', statusRouter)
app.use('/payment-method', paymentMethodRouter)

app.get('/', (req, res) => {
    res.send('<h1>Welcome to API for MộcPhúc. website Angular</h1>')
})

// upload ảnh
app.post('/upload' , (req , res)=>{
    console.log(req.files.file)
    if(!req.files.file) {
        return res.status(400).send('No files were uploaded.')
    }

    let allowedFileExtensions = ['jpg', 'jpeg', 'png'];
    let sampleFile = req.files.file
    let fileName = sampleFile.name

    let ext = fileName.substring(fileName.lastIndexOf('.') + 1);
    if(!allowedFileExtensions.includes(ext.toLowerCase())) {
        return res.status(400).send('Không đúng định dạng ảnh')
    }

    let uploadPath = __dirname + '/uploads/' + fileName

    sampleFile.mv(uploadPath, (err) => {
        if(err) {
            return res.status(500).send(err)
        }

        imgur.uploadFile(uploadPath).then((urlOnject) => {
            fs.unlinkSync(uploadPath)
            res.send({result: urlOnject.link})
        })
    })
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})