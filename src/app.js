const express = require('express')
const { engine } = require('express-handlebars')
const fileUpload = require('express-fileupload')
const mysql = require('mysql')

const app = express()

//default option
app.use(fileUpload())

//static files
app.use(express.static('public'))
app.use(express.static('public/upload'))

//template engine
app.engine('.hbs', engine({ extname: '.hbs'}))
app.set('view engine', '.hbs')
app.set('views', './public/views')

//connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "1234",
    database: "fileupload-jobs-node"
})


//routes
app.get('/', (req, res) => {
    try {
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
    } catch (error) {
        console.error("[GET]: ", error.message)
        res.status(500).send(error)
    }
})


app.post('/', (req, res) => {
    let sampleFile, uploadPath, nameFile

    if(!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded')
    }

    try {
        //name of the input is sampleFile
        sampleFile =  req.files.sampleFile
        // uploadPath = __dirname + '/upload/' + sampleFile.name
        nameFile = Date.now() + "." + req.files.sampleFile.name.split('.').pop()
        uploadPath = 'public/upload/' + nameFile


        //use mv() to place file on the server
        sampleFile.mv(uploadPath, function(err) {
            if(err) return res.status(500).send(err.message)

            pool.getConnection((err, conn) => {
                if(err) throw err
                console.log('CONNECTED')

                conn.query(`UPDATE users SET profile_image = ? WHERE id= 1`,
                    [nameFile], (err, rows) => {
                        //once done, release connection
                        conn.release()

                        if(!err) {
                            res.redirect('/')
                        } else {
                            console.error(err)
                        }
                    }
                )
            })
        })
    } catch (error) {
        console.error("[GET]: ", error.message)
        res.status(500).send(error)
    }
})


module.exports = app
