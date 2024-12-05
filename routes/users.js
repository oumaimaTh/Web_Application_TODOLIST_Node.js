const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Todo = require('../models/Todo');
// Load User model
const User = require('./../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login', { user: req.user }));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register',));


// Register
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                );
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});


// creer une tache
router.post("/addlist", (req, res) => {
    const { title, description, date } = req.body;

    // Vérifiez si req.user est défini
    if (req.user && req.user._id) {
        const newTodo = new Todo({
            user: req.user._id,
            title,
            description,
            date
        });

        // Enregistrez la liste de tâches dans la base de données
        newTodo.save()
            .then(() => {
                console.log("Successfully added todo!");
                res.redirect("/list");
            })
            .catch((err) => {
                console.error(err);
                req.flash('error_msg', 'Une erreur s\'est produite lors de l\'ajout de la tâche');
                res.redirect("/users/addlist");
            });
    } else {
        console.error("req.user is undefined or req.user._id is undefined");
        req.flash('error_msg', 'Une erreur s\'est produite lors de l\'ajout de la tâche');
        res.redirect("/users/addlist");
    }
});






module.exports = router;
