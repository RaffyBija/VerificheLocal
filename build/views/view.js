//Richiesta dipendenza
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');

const common = require('../midw/common');
const session = require('../midw/session');
router.use(session.router);


// Endpoint per la home
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../nopublic/index.html"));
});

// Endpoint per mostrare la pagina di Login
router.get('/login', (req, res) => {
    if(req.session.isAuthenticated){
        if(req.session.classe === 'admin'){
            return res.sendFile(path.join(__dirname, "../nopublic/dbdashboard.html"));
        } else if(req.session.classe === 'doc'){
           return res.sendFile(path.join(__dirname, "../nopublic/docdashboard.html"));
        } else {
            return res.sendFile(path.join(__dirname, "../nopublic/studentdashboard.html"));
        }
    }
    res.sendFile(path.join(__dirname, "../nopublic/login.html"));
});

// Endpoint per mostrare la pagina di registrazione
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, "../nopublic/register.html"));
});

// Route per visualizzare l'app File Transfer
router.get('/upload', common.checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "../nopublic/loadfile.html"));
});

// Endpoint per mostrare la Dashboard Docente
router.get('/docdashboard', common.checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "../nopublic/docdashboard.html"));
});

// Endpoint per mostrare la dashboard del database
router.get('/dbdashboard', common.checkAuth, (req, res) => {
    // Controllo se l'utente è un docente o admin
    if (req.session.classe === 'admin') {
        res.sendFile(path.join(__dirname, "../nopublic/dbdashboard.html"));
    }
});

// Endpoint per mostrare la Dashboard Studente
router.get('/verificastudente', common.checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "../nopublic/studentdashboard.html"));
});

router.get('/getCorrezione', common.checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "../nopublic/vista_risultati.html"));
}
);

module.exports = router;