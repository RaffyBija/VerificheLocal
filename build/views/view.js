//Richiesta dipendenza
const express = require('express');
const router = express.Router();
const path = require('path');
const paths = require('../config/paths');
const common = require('../midw/common');
const session = require('../midw/session');
router.use(session.router);


// Endpoint per la home
// router.get('/', (req, res) => {
//     res.sendFile(path.join(paths.PRIVATE_DIR, "index.html"));
// });

// Endpoint per mostrare la pagina di registrazione
// router.get('/register', (req, res) => {
//     res.sendFile(path.join(paths.PRIVATE_DIR, "register.html"));
// });

// Route per visualizzare l'app File Transfer
router.get('/upload', common.checkAuth, (req, res) => {
    res.sendFile(path.join(paths.PRIVATE_DIR, "loadfile.html"));
});

// Endpoint per mostrare la Dashboard Docente
router.get('/docdashboard', common.checkAuth, (req, res) => {
    if(req.session.user.Classe ==='admin' || req.session.user.Classe ==='doc')
        res.sendFile(path.join(paths.PRIVATE_DIR, "docdashboard.html"));
    else
        res.sendStatus(403);
});

// Endpoint per mostrare la dashboard del database
router.get('/dbdashboard', common.checkAuth, (req, res) => {
    // Controllo se l'utente è un docente o admin
    if (req.session.user.Classe === 'admin') {
        res.sendFile(path.join(paths.PRIVATE_DIR, "dbdashboard.html"));
    } else {
        res.sendStatus(403);
    }
});

// Endpoint per mostrare la dashboard dello studente
router.get('/studentdashboard', common.checkAuth, (req, res) => {
    res.sendFile(path.join(paths.PRIVATE_DIR, "studentedashboard.html"));
}
);

// Endpoint per mostrare la Verifica allo Studente
router.get('/verificastudente', common.checkAuth, (req, res) => {
    res.sendFile(path.join(paths.PRIVATE_DIR, "studente_verifica.html"));
});

// Endpoint per mostrare la pagina di correzione
router.get('/getCorrezione', common.checkAuth, (req, res) => {
    res.sendFile(path.join(paths.PRIVATE_DIR, "vista_risultati.html"));
}
);

module.exports = router;