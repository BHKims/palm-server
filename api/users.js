var express = require("express");
var app = express.Router();
var User = require('./../user');

let jwt = require('jsonwebtoken');
let secretObj = require('../config/jwt');

app.get('/', (req,res) => {
    
    User.find({}, (err,users)=>{
        if(err){console.log(err)}
        console.log(users);
        res.json({result:true, users: users});
    })
})

app.get('/checkToken', (req, res) => {
    console.log("[checkToken] req.cookies: ", req);
    let token = req.cookies.user;
    console.log(token);
    if(token) {
        let decoded = jwt.verify(token, secretObj.secret);

        User.find({email: decoded.email}, (err, user) => {
            if(err){console.log(err)}
            console.log('user: ', user);

            if(user.length != 0) {
                res.json({
                    result:true, 
                    user: user, 
                });
            } else {
                res.json({result:false, err:'no_user'})
            }
        });
    }
    else {
        res.json({result:false, err:'no_token'});
    }
})

app.post('/isuser', (req,res) => {
    console.log('[isuser] email: ', req.body.id);

    let token = jwt.sign(
        {
            email: req.body.id
        },
        secretObj.secret,
        {
            expiresIn: '5m'
        }
    )

    User.find({email:req.body.id, pw:req.body.pw}, (err, user) => {
        if(err){console.log(err)}
        console.log('user: ', user);

        if(user.length != 0) {
            //res.header('Access-Control-Allow-Origin', req.headers.origin);
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.cookie("user", token, {maxAge: 360000});
            res.json({
                result:true, 
                user: user, 
                token: token
            });
        } else {
            res.json({result:false, err:'no_user'})
        }
    })
})
app.get(`/getuser/:id`, (req,res) => {
    console.log(req.params);
    User.find({_id:req.params.id}, (err, user) => {
        if(err){console.log(err)}
        console.log('user: ', user);

        if(user) {
            res.json({result:true, user: user});
        } else {
            res.json({result:false, err:'no_user'})
        }
    })
})
app.post(`/adduser`, (req,res) => {
    console.log(req.body);
    User.find({id:req.body.id}, (err,user) => {
        if(err){console.log(err)}
        if(user.length == 0) {
            User.addUser(req.body.id, req.body.pw, req.body.name, 1).then(user => {
                res.json({result:true, user:user})
            })
            .catch(err => {
                console.log(err)
            })
        } else {
            res.json({result:false, err:'duplicate_user'})
        }
    })
})

module.exports = app;