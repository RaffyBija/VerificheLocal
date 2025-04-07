const express = require('express');
const router = express.Router();
const session = require('express-session');
const sessionManager = require('./sessionManager');
require('dotenv').config();

// Configurazione del middleware di sessione
const sessionStore = new session.MemoryStore();

router.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false, // Evita di risalvare la sessione se non modificata
    saveUninitialized: false, // Evita di salvare sessioni vuote
    cookie: { secure: false, maxAge: 3600000 } // Configura i cookie (usa secure: true in produzione con HTTPS)
}));

// Route per vedere le sessioni attive
router.get('/sessions', (req, res) => {
    res.json({ inSessions: sessionManager.getSessions() });
    //console.log("API SESSIONS: ", sessionManager.getSessions());
});

// Endpoint Debug per la session
router.get('/api/debug-session', (req, res) => {
    res.json({ session: req.session });
});

router.get('/api/get-userInfo', (req, res) => {
    if (req.session.isAuthenticated) {
        res.json({
            user: req.session.user,
        });
    } else {
        res.status(401).json({ error: 'Utente non autenticato' });
    }
});

router.get('/api/get-username', (req, res) => {
    if (req.session.isAuthenticated) {
        res.json({
            username: req.session.user.username,
        });
    } else {
        res.status(401).json({ error: 'Utente non autenticato' });
    }
});

router.get('/api/get-user-class', (req, res) => {
    if (req.session.isAuthenticated) {
        res.json({
            classe: req.session.user.Classe,
        });
    } else {
        res.status(401).json({ error: 'Utente non autenticato' });
    }
});

router.get('/api/isAuthenticated', (req, res) => {
    if (req.session.isAuthenticated) {
        res.json({
            isAuthenticated: true,
            user: req.session.user,
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

module.exports = {
    router
};
