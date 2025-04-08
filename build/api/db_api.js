const express = require('express');
const db = require('../../dbapp2');
const app = express.Router();
const common = require('../midw/common');
const sessionManager = require('../midw/sessionManager');
// Endpoint per restituire l'intero Database
app.post('/data', common.checkAuth, async (req, res) => {
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
app.put('/update', async (req, res) => {
    // Controlla se l'utente è autenticato
    if(!req.session.isAuthenticated) {
        return res.status(401).send("Non sei autorizzato ad accedere a questa risorsa.");
    }
    // Controlla se l'utente è autorizzato
    if (!req.session.isAuthenticated || !req.session.user.Classe==='admin') {
        return res.status(403).send("Accesso negato. Solo gli amministratori possono aggiornare i record.");
    }
    const user = req.body;
    console.log("User: ", user);
    try {
        const result = await db.findPassword(user.ID);
        const encryptedPassword = common.encryptPassword(user.Password);
        if (!(result.Password === user.Password)) user.Password = encryptedPassword;
        await db.updateUser(user);

        const updatedUser = await db.findUserByID(user.ID); // Recupera i dati aggiornati
        res.status(200).json({message:"Dati aggiornati con successo",user:updatedUser}); // Restituisci i dati aggiornati
    } catch (err) {
        console.error("Errore durante l'aggiornamento del record:", err);
        res.status(500).send("Errore server durante l'aggiornamento del record");
    }
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
app.delete('/delete/:id', async (req, res) => {
    // Controlla se l'utente è autenticato
    if (!req.session.isAuthenticated) {
        return res.status(401).send("Non sei autorizzato ad accedere a questa risorsa.");
    }
    // Controlla se l'utente è autorizzato
    if (!req.session.user || req.session.user.Classe !== 'admin') {
        return res.status(403).send("Accesso negato. Solo gli amministratori possono eliminare i record.");
    }

    const { id } = req.params;
    try {
        await db.deleteUser(id); // Elimina il record dal database
        res.json({ messaggio: "Record eliminato con successo!" });
    } catch (err) {
        console.error("Errore server durante l'eliminazione di un record: ", err);
        res.status(500).send("Errore server durante l'eliminazione del record");
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