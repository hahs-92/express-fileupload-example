const express = require('express')
const { engine } = require('express-handlebars')

const app = express()

const PORT = process.env.PORT || 5000

//template engine
app.engine('.hbs', engine({ extname: '.hbs'}))
app.set('view engine', '.hbs')
app.set('views', './views')

//routes
app.get('/', (req, res) => {
    res.render('index')
})

app.listen(PORT, () => {
    console.log(`server listening in port: ${ PORT }`)
})