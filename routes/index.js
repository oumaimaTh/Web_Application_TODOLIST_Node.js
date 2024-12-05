const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Todo = require('../models/Todo');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome', { user: req.user }));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', {
        user: req.user
    })
);


// Dans le route pour list
router.get('/list', ensureAuthenticated, async (req, res) => {
    try {
        const userTodos = await Todo.find({ user: req.user._id });
        res.render('list', {
            user: req.user,
            todos: userTodos
        });
    } catch (error) {
        console.error(error);
        res.redirect('dashboard');
    }
});




router.get('/users/addlist', ensureAuthenticated, (req, res) =>
    res.render('addlist', {
        user: req.user
    })
);

// delete tache
router.get('/delete/:id', ensureAuthenticated, async (req, res) => {
    try {
        const todoId = req.params.id;

        // Supprimez la liste de tâches de la base de données en utilisant l'ID
        await Todo.findByIdAndRemove(todoId);

        // Redirigez l'utilisateur vers la page de liste après la suppression
        res.redirect('/list');
    } catch (error) {
        console.error(error);
        res.redirect('list'); // Vous pouvez rediriger vers une page d'erreur si nécessaire
    }
});


// update tache
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
        const todoId = req.params.id;

        // Récupérez la liste de tâches à éditer de la base de données en utilisant l'ID
        const todoToEdit = await Todo.findById(todoId);

        // Affichez le formulaire d'édition avec les données existantes
        res.render('edit', {
            user: req.user,
            todo: todoToEdit
        });
    } catch (error) {
        console.error(error);
        res.redirect('dashboard'); // Vous pouvez rediriger vers une page d'erreur si nécessaire
    }
});

// Ajoutez une route pour gérer la soumission du formulaire d'édition (par exemple, via une requête POST)
router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
        const todoId = req.params.id;
        const updatedTitle = req.body.updatedTitle;
        const updatedDescription = req.body.updatedDescription;

        // Mettez à jour la liste de tâches dans la base de données en utilisant l'ID
        await Todo.findByIdAndUpdate(todoId, { title: updatedTitle, description: updatedDescription });

        // Redirigez l'utilisateur vers la page de liste après l'édition
        res.redirect('/list');
    } catch (error) {
        console.error(error);
        res.redirect('dashboard'); // Vous pouvez rediriger vers une page d'erreur si nécessaire
    }
});



module.exports = router;
