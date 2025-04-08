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
    const { Cognome, Nome, Username, Password, Classe } = req.body;
    if (!Cognome || !Nome || !Username || !Password || !Classe) {
        return res.status(400).send('Tutti i campi sono obbligatori');
    }

    try {
        // Verifica se l'utente esiste già
        const existingUser = await db.findUser(Username, Classe);
        if (existingUser) {
            return res.status(409).send('Username già in uso!' );
        }

        // Crittografa la password
        const encryptedPassword = common.encryptPassword(Password);

        // Salva l'utente
        const formattedNome = Nome.charAt(0).toUpperCase() + Nome.slice(1).toLowerCase();
        const formattedCognome = Cognome.charAt(0).toUpperCase() + Cognome.slice(1).toLowerCase();
        const formattedClasse = Classe.replace(/\s+/g, '').toUpperCase();
        await db.saveUser(formattedNome, formattedCognome, Username.toLowerCase(), encryptedPassword, formattedClasse);

        // Risposta diversa in base al contesto
        if (req.session && req.session.isAuthenticated) {
            // Richiesta da un utente autenticato (es. admin)
            const newUser = await db.findUser(Username, Classe);
            res.status(201).json({ message: 'Utente aggiunto con successo', user: newUser });
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
            return res.status(401).json({ message: 'Credenziali invalidi!' });
        } 
        const userInfo = {
            username: username,
            Nome: user.Nome,
            Cognome: user.Cognome,
            ID: user.ID,
            Classe: user.Classe
        }
        // Salva le informazioni dell'utente nella sessione
        req.session.user = {...userInfo};
        req.session.isAuthenticated = true;

        // Verifica se la sessione esiste già in sessionManager
        if (!sessionManager.sessionExists(req.sessionID, req.session.user.ID)) {
            // Salva la sessione in sessionManager
            sessionManager.addSession(req.sessionID, req.session.user.ID, req.session.isAuthenticated);
        }

        req.session.save(err => {
            if (err) {
                console.error('Errore nel salvataggio della sessione: ', err);
                return res.status(500).json({error:'Errore interno del server'});
            }
            const role = roles[req.session.user.Classe] || { message: "Accesso Riuscito!", redirectTo: "/studentdashboard" };
            res.json({ success: true, ...role,user: {...userInfo} })
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during login');
    }
});

// Route per il logout
router.get('/logout', (req, res) => {
    // Rimuove l'utente dalla sessione in sessionManager
    sessionManager.removeSession(req.sessionID,req.session.user.ID);

    // Distrugge la sessione
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({error:'Error logging out'});
        }

        //console.log('Logout effettuato con successo');
        //console.log(sessionManager.getSessions());
        // Pulisce il cookie della sessione
        res.clearCookie('connect.sid');

        //Invia una risposta di successo
        res.status(200).json({ message: 'Logout effettuato con successo' });
    });
});

module.exports = router;