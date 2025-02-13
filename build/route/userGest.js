//Richiesta dipendenza
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const common = require('../midw/common');

const session = require('../midw/session');
router.use(session.router);

//Richiesta servizi mysql
const db = require('../../dbapp2');

// Middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

let inSessions = require('../midw/session').inSessions;
// Route per la registrazione
router.post('/register', async (req, res) => {
    const { nome, cognome, username, password, classe } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Missing username or password' });
    }

    try {
        // Verifica se l'utente esiste già
        const existingUser = await db.findUser(username, classe);
        if (existingUser) {
            return res.status(409).json({ message: 'Username già in uso!' });
        }

        // Crittografa la password
        const encryptedPassword = common.encryptPassword(password);

        // Salva l'utente
        await db.saveUser(nome, cognome, username.toLowerCase(), encryptedPassword, classe.toUpperCase());
        res.status(201).json({ message: 'User registered successfully', redirectTo: '/login' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user: ' + error });
    }
});

// Ruoli degli utenti
const roles = {
    admin: { message: "Accesso Riuscito come admin!", redirectTo: "/dbdashboard" },
    doc: { message: "Accesso riuscito come docente!", redirectTo: "/docdashboard" }
};

// Route per il login
router.post('/login', async (req, res) => {
    const { username, password, classe } = req.body;
    if (!username || !password) {
        return res.status(400).send('Missing username or password');
    }

    try {
        // Salva i dati ricevuti dal database
        const user = await db.findUser(username, classe);
        if (!user || !(common.matchPassword(user.Password, password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        } else {
            // Salva le informazioni dell'utente nella sessione
            req.session.user = user.Nome;
            req.session.userSurname = user.Cognome;
            req.session.userID = user.ID;
            req.session.isAuthenticated = true;
            req.session.classe = user.Classe;

            // Salva la sessione in un array
            session.inSessions.push({ sessionID: req.sessionID, userID: req.session.userID, isAuthenticated: req.session.isAuthenticated });

            req.session.save(err => {
                if (err) {
                    console.error('Errore nel salvataggio della sessione: ', err);
                    return res.status(500).send('Errore interno del server');
                }
                const role = roles[req.session.classe] || { message: "Accesso Riuscito!", redirectTo: "/verificastudente" };
                res.json({ success: true, ...role })
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during login');
    }
});

// Route per il logout
router.get('/logout', (req, res) => {
    // Rimuove l'utente dalla sessione
    inSessions = inSessions.filter(info => info.userID !== req.session.userID);

    // Distrugge la sessione
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging out');
        }

        // Pulisce il cookie della sessione
        res.clearCookie('connect.sid');

        // Esegue il redirect alla pagina di login
        res.redirect('/login');
    });
});

module.exports = router;