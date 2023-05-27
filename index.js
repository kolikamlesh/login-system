const express = require('express')
const bCrypt = require('bcrypt')
const mysql = require('mysql')
const app = express()
const log = console.log
const root = __dirname

// middlewares
app.use(express.static('./public'))
app.use(express.urlencoded({extended: true}))

// middleware def

function isValidPass(req, res, next){
    let password = req.body.password;
    let repeatPassword = req.body.repeatPassword;    
    let error

    if(password != repeatPassword){
        error = {error: 'password mismatched'}
    }

    else if(password.length <8){
        error = {error: 'password length must greater than or equal to 8'}
    }

    next()
}

// to check is it valid fetching database for duplicacy

function isValidUserMail(req, res, next){
    let username = req.body.username
    let email = req.body.email
    let error
    let query = `select id from user where username = '${username}' or email = '${email}'`

    connection.query(query, (err, result) => {

        if(result.length != 0){
            error = {error: 'username or email already exist'}
        }
    })

    next()
}

function validateUser(req, res, next){
    let username = req.body.username
    let password = req.body.password
    let error
    let query = `select password from user where username = '${username}'`

    connection.query(query, (err, result) => {
        if(result.length != 1){
            error = {error: 'username incorrect'}
        }

        else{
            bCrypt.compare(password, result[0].password, (err, result) => {
                if(err != undefined){
                    log(err)
                }

                if(result == true){
                    log('user logged in successfully')
                    next()
                }

                else{
                    error = {error: 'password not matched'}
                }
            })
        }
    })
}

// database
const connection = mysql.createConnection({
    user: 'root',
    password: 'root',
    host: 'localhost',
    database: 'user'
})

// get request
app.get('/', (req, res) => {
    res.sendFile(root + '/public/login.html')
})

app.get('/homepage', (req, res) => {
    res.sendFile(root + '/public/homepage.html')
})

app.get('/login', validateUser, (req, res) => {
    
    res.redirect('/homepage')
})

// post request

app.post('/login', validateUser, (req, res) => {
    
    res.redirect('/homepage')
})

app.post('/register', isValidPass, isValidUserMail, (req, res) => {
    let password = req.body.password
    let email = req.body.email
    let username = req.body.username
    
    let hashPassword = bCrypt.hash(password, 10, (err, hash) => {
        let query = `insert into user(username, email, password) values('${username}', '${email}', '${hash}')`

        if(err != undefined){
            log(err)
        }

        else{
            connection.query(query, (err, result) => {
                if(err != undefined){
                    log(err)
                }

                else{
                    log('user registered successfully')
                    res.redirect('/')
                }
            })
        }
    })

    log('valid user push to table')

})

//listening on port 9000
app.listen(9000, (err) => {
    if(err != undefined){
        log(err)
    }

    else{
        log('listening on port 9000')
    }
})

// function section

