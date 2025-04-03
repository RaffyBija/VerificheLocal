const express = require('express');
const router = express.Router();
const path = require('path');
const paths = require('../config/paths');
const fs = require('fs');
const { checkAuth } = require('../midw/common');

router.get('/reView', checkAuth, (req, res) => {
    const {username, surname, classe} = req.query;

    if(req.session.user !== username && req.session.classe !== classe && req.session.userSurname !== surname){
        return res.status(403).send('Accesso negato');
    }

    const sanitizedCognome = surname.toLowerCase().replace(/\s+/g, '');
    const sanitizedNome = username.substring(0, 1).toUpperCase();
    const fileName = `${sanitizedCognome}${sanitizedNome}.pdf`;
    const filePath = path.join(paths.CORRECTIONS_DIR, classe, fileName);
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');
        fs.createReadStream(filePath).pipe(res);//Invia il PDF in streaming
    } else {
        res.status(404).send('File non trovato');
    }
});

module.exports = router;
