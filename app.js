const express = require('express')
const { engine } = require('express-handlebars')
const fileUpload = require('express-fileupload')
const mysql = require('mysql')

const app = express()
const PORT = process.env.PORT || 5000

//default option
app.use(fileUpload())

//static files
app.use(express.static('public'))
app.use(express.static('upload'))

//template engine
app.engine('.hbs', engine({ extname: '.hbs'}))
app.set('view engine', '.hbs')
app.set('views', './views')

//connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "1234",
    database: "fileupload-jobs-node"
})


// pool.getConnection((err, conn) => {
//     if(err) throw err
//     console.log('CONNECTED')
// })

//routes
app.get('/', (req, res) => {
    pool.getConnection((err, conn) => {
        if(err) throw err
        console.log('CONNECTED')

        conn.query(`SELECT * FROM users WHERE id=?`,[1], (err, rows) => {
            //once done, release connection
            conn.release()

            if(!err) {
                res.render('index', {rows})
            }
        })
    })
})


app.post('/', (req, res) => {
    let sampleFile, uploadPath

    if(!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded')
    }

    //name of the input is sampleFile
    sampleFile = req.files.sampleFile
    uploadPath = __dirname + '/upload/' + sampleFile.name

    //use mv() to place file on the server
    sampleFile.mv(uploadPath, function(err) {
        if(err) return res.status(500).send(err.message)

        // res.send('File uploaded!')


        pool.getConnection((err, conn) => {
            if(err) throw err
            console.log('CONNECTED')

            conn.query(`UPDATE users SET profile_image = ? WHERE id= 1`,[sampleFile.name], (err, rows) => {
                //once done, release connection
                conn.release()

                if(!err) {
                    res.redirect('/')
                } else {
                    console.error(err)
                }
            })
        })
    })
})

app.listen(PORT, () => {
    console.log(`server listening in port: ${ PORT }`)
})