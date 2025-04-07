const express = require('express');
const router = express.Router();
const path = require('path');
const paths = require('../config/paths');
const fs = require('fs');
const {getDirectoryStructure} = require('../utils/fileUtils');

// Helper per ottenere i dati dell'utente dalla sessione
const getUserFromSession = (req) => {
    if (!req.session || !req.session.user) {
        return null;
    }
    return {
        Cognome: req.session.user.Cognome,
        Nome: req.session.user.Nome,
        Classe: req.session.user.Classe,
    };
};

// Helper per costruire il percorso base della directory personale
const getBaseDir = (user) => {
    const sanitizedCognome = user.Cognome.replace(/\s+/g, '');
    const personalDir = `${sanitizedCognome}_${user.Nome}`;
    return path.join(paths.CORRECTIONS_DIR, user.Classe, personalDir);
};

// Helper per verificare l'esistenza di un file o directory
const verifyPathExists = (absolutePath, baseDir) => {
    return absolutePath.startsWith(baseDir) && fs.existsSync(absolutePath);
};

//Restituisco la cartella personale con la lista dei file per la revisione della verifica
router.get('/get-personal-review-folder', (req, res) => {
    const user = getUserFromSession(req);

    if (!user) {
        return res.status(401).json({error:"Utente non autenticato"});
    }

    const baseDir = getBaseDir(user);
    const currentDir = req.query.dir ? path.join(baseDir, req.query.dir) : baseDir;

    // Verifica che la cartella esista
    if (!verifyPathExists(currentDir, baseDir)) {
        return res.status(404).json({ error: 'Cartella non trovata' });
    }

    const structure = getDirectoryStructure(currentDir);
    if (!structure) {
        return res.status(404).json({ error: 'Errore nella lettura della directory' });
    }

    router.use(express.static(currentDir));// Serve i file statici dalla directory corrente

    const parentDir = req.query.dir ? path.dirname(req.query.dir) : '';

    // Restituisci la struttura della directory come JSON
    res.status(200).json({
        currentPath: path.relative(baseDir, currentDir),
        parentDir,
        files: structure.map(item => ({
            name: item.name,
            type: item.type,
            path: path.relative(baseDir, item.path)
        }))
    });
});

// Endpoint per servire un file specifico
router.get('/get-file', (req, res) => {
    const user = getUserFromSession(req);

    if (!user) {
        return res.status(401).json({ error: 'Utente non autenticato' });
    }

    const baseDir = getBaseDir(user);

    // Percorso relativo del file richiesto
    const relativeFilePath = req.query.file;
    if (!relativeFilePath) {
        return res.status(400).json({ error: 'Percorso del file non specificato' });
    }

    // Percorso assoluto del file
    const absoluteFilePath = path.join(baseDir, relativeFilePath);

    // Verifica che il file esista e sia all'interno della directory dell'utente
    if (!verifyPathExists(absoluteFilePath, baseDir)) {
        return res.status(404).json({ error: 'File non trovato' });
    }

    // Invia il file al client
    res.sendFile(absoluteFilePath);
});

module.exports = router;
