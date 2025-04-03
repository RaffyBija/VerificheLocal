//Richiesta dipendenza
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const common = require('../midw/common');
const sessionManager = require('../midw/sessionManager');

const session = require('../midw/session');
router.use(session.router);

//Richiesta servizi mysql
const db = require('../../dbapp2');

// Middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Route per la registrazione o aggiunta di un nuovo utente
router.post('/register', async (req, res) => {
    const { nome, cognome, username, password, classe } = req.body;
    if (!nome || !cognome || !username || !password || !classe) {
        return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
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
        const formattedNome = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
        const formattedCognome = cognome.charAt(0).toUpperCase() + cognome.slice(1).toLowerCase();
        const formattedClasse = classe.replace(/\s+/g, '').toUpperCase();
        await db.saveUser(formattedNome, formattedCognome, username.toLowerCase(), encryptedPassword, formattedClasse);

        // Risposta diversa in base al contesto
        if (req.session && req.session.isAuthenticated) {
            // Richiesta da un utente autenticato (es. admin)
            res.status(201).json({ message: 'Utente aggiunto con successo' });
        } else {
            // Richiesta da un utente non autenticato (es. registrazione pubblica)
            res.status(201).json({ message: 'Utente registrato con successo', redirectTo: '/login' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante l\'operazione: ' + error });
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

            // Salva la sessione in sessionManager
            sessionManager.addSession(req.sessionID, req.session.userID, req.session.isAuthenticated);

            req.session.save(err => {
                if (err) {
                    console.error('Errore nel salvataggio della sessione: ', err);
                    return res.status(500).send('Errore interno del server');
                }
                const role = roles[req.session.classe] || { message: "Accesso Riuscito!", redirectTo: "/studentdashboard" };
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
    // Rimuove l'utente dalla sessione in sessionManager
    sessionManager.removeSession(req.sessionID,req.session.userID);

    // Distrugge la sessione
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging out');
        }

        //console.log('Logout effettuato con successo');
        //console.log(sessionManager.getSessions());
        // Pulisce il cookie della sessione
        res.clearCookie('connect.sid');

        // Esegue il redirect alla pagina di login
        res.redirect('/login');
    });
});

module.exports = router;