const express = require('express');
const db = require('../../dbapp2');
const app = express.Router();
const common = require('../midw/common');
const sessionManager = require('../midw/sessionManager');
// Endpoint per restituire l'intero Database
app.get('/data', common.checkAuth, async (req, res) => {
    try {
        const inSessions = sessionManager.getSessions();
        const users = await db.showUser();
        users.forEach(user => {
            inSessions.forEach(info => {
                if (user.ID === info.userID)
                    user.isOnline = info.isAuthenticated;
            })
        });
        res.status(200).json(users);
    } catch (err) {
        console.log("Errore: ", err);
    }
});


// Endpoint per aggiornare un record
app.post('/update', common.checkAuth, async (req, res) => {
    const user = req.body;
    const result = await db.findPassword(user.ID);
    const encryptedPassword = common.encryptPassword(user.Password);

    if (!(result.Password === user.Password)) user.Password = encryptedPassword;
    await db.updateUser(user);
    const updateUser = await db.findUserByID(user.ID);
    res.status(200).json({ updateUser, messaggio: 'Campo aggiornato con successo!' });
});

// Endpoint per restituire le info dell'utente
app.get('/user', common.checkAuth, (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Utente non autenticato');
    }
    res.json({ 
        username: req.session.user,
        surname: req.session.userSurname,
        classe: req.session.classe
    });
});

// Endpoint per ottenere Dati Specifici dal database
app.get('/data/:id', common.checkAuth, async (req, res) => {
    const { id } = req.params;

    try {
        const user = await db.findUserByID(id);
        res.json(user);
    } catch (err) {
        console.error("Errore: ", err);
    }
});

// Endpoint per eliminare un record
app.delete('/delete/:id', common.checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await db.deleteUser(id);
        res.json({ messaggio: "Record eliminato con successo!" });
    } catch (err) {
        console.error("Errore server durante l'eliminazione di un record: ", err);
    }
});

// Endpoint per recuperare una password
app.get('/password/:id', common.checkAuth, async (req, res) => {
    const { id } = req.params;
    const data = await db.findPassword(id);
    const decryptedPassword = common.decryptPassword(data.Password);
    res.status(201).json(decryptedPassword);
});

// Endpoint per recuperare la lista delle classi esistenti
app.get('/classes', common.checkAuth, async (req, res) => {
    try {
        const classes = await db.getClassi();
        res.status(200).json(classes);
    } catch (err) {
        console.error("Errore: ", err);
        res.status(500).send("Errore server durante il recupero delle classi");
    }
});


module.exports = app;