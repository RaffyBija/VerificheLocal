const express = require('express');
const router = express.Router();
const path = require('path');
const paths = require('../config/paths');
const fs = require('fs');
const { checkAuth } = require('../midw/common');
const {getDirectoryStructure} = require('../utils/fileUtils');

// router.get('/reView', checkAuth, (req, res) => {
//     const {username, surname, classe} = req.query;

//     if(req.session.user !== username && req.session.classe !== classe && req.session.userSurname !== surname){
//         return res.status(403).send('Accesso negato');
//     }

//     const sanitizedCognome = surname.toLowerCase().replace(/\s+/g, '');
//     const sanitizedNome = username.substring(0, 1).toUpperCase();
//     const fileName = `${sanitizedCognome}${sanitizedNome}.pdf`;
//     const filePath = path.join(paths.CORRECTIONS_DIR, classe, fileName);
//     if (fs.existsSync(filePath)) {
//         res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
//         res.setHeader('Content-Type', 'application/pdf');
//         fs.createReadStream(filePath).pipe(res);//Invia il PDF in streaming
//     } else {
//         res.status(404).send('File non trovato');
//     }
// });

//Restituisco la cartella personale con la lista dei file per la revisione della verifica
router.get('/get-review', checkAuth, (req,res)=>{
    const user ={
        username: req.session.user,
        surname: req.session.userSurname,
        classe: req.session.classe
    }
    if(!user){
        res.status(401).send('Utente non autenticato');
    }
    
    const sanitizedCognome = user.surname.replace(/\s+/g, '');
    const personalDir = `${sanitizedCognome}_${user.username}`;
    const baseDir = path.join(paths.CORRECTIONS_DIR, user.classe,personalDir);
    const currentDir = req.query.dir ? path.join(baseDir, req.query.dir) : baseDir;
    
    // Verifica che la cartella esista
    if (!fs.existsSync(currentDir)) {
        return res.status(404).send('Cartella non trovata!');
    }

    router.use(express.static(currentDir));
    
    const structure = getDirectoryStructure(currentDir);
    if (!structure) {
        return res.status(404).send('Directory non trovata');
    }
    let parentDir = req.query.dir ? path.dirname(req.query.dir) : ''; // Indirizzo per tornare indietro
    // Prepara il contenuto HTML
    let html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Explorer</title>
        <link rel="stylesheet" href="/css/explorer_style.css" />
    </head>
    <body>
        <header>
            <a href="/studentdashboard" id="home-button">🏠</a>
            <h1>Cartella delle Verità</h1>
        </header>
        <main>
            <a href="?dir=${parentDir}" id="back-button">↰</a>
            <span id="current-path">>D:/${path.relative(baseDir, currentDir)}</span>
            <ul>
    `;

    // Aggiungi i file e le cartelle alla lista
    structure.forEach(item => {
        if (item.type === 'directory') {
            html += `<li><a href="?dir=${path.relative(baseDir, item.path)}">📂 ${item.name}/</a></li>`;
        } else {
            html += `<li><a href="${path.relative(baseDir, item.path)}" target="_blank">📄 ${item.name}</a></li>`;
        }
    });

    html += `
            </ul>
        </main>
    </body>
    </html>
    `;

    res.status(200).send(html);
})

module.exports = router;
