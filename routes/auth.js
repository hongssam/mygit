/**
 * Created by ss on 2017-07-06.
 */
var express = require('express');
var router = express.Router();
var User = require('../models/user');

// PBKDF2 - secure password
var pbkdf2Password = require('pbkdf2-password');
var hasher = pbkdf2Password();

router.get('/regist', function (req, res) {
    res.render('auth/regist', { title: '36.5 Arts' });
});

router.post('/regist', function (req, res) {
    hasher({password: req.body.password}, function (err, pass, salt, hash) {
        var user = new User();
        user.email = req.body.email;
        user.password = hash;
        user.salt = salt;
        user.nickname = req.body.nickname;
        user.major = req.body.major;

        user.save(function (err) {
            if(err){
                console.log(err);
                res.redirect('/');
            }
            req.session.email = user.email;
            res.redirect('/');
        });
    });
});

router.get('/login', function (req, res) {
    res.render('auth/login', { title: '36.5 Arts' });
});

router.post('/login', function (req, res) {
    var inputEmail = req.body.email;

    User.findOne({email: inputEmail}, function (err, user) {
        if(err) return res.send({error: 'dbNotFound'});
        if(!user) return res.send({error: 'userNotFound'});

        var inputPassword = req.body.password;
        hasher({password:inputPassword, salt:user.salt}, function (err, pass, salt, hash) {
            if(hash === user.password){
                req.session.email = user.email;
                res.send({success: 1})
            }else{
                res.send({error: 'failedLogin'});
            }
        });
    });
});

router.get('/logout', function (req, res) {
    if(req.session.email){
        req.session.destroy(function (err) {
            if(err){
                console.log(err);
            }else{
                res.redirect('/');
            }
        })
    }else{
        res.redirect('/');
    }
});

module.exports = router;
