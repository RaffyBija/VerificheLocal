const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { checkAuth } = require('../midw/common');

router.get('/reView', checkAuth, (req, res) => {
    const {username, surname, classe} = req.query;


    const sanitizedCognome = surname.replace(/\s+/g, '');
    const sanitizedNome = username.replace(/\s+/g, '');
    const sanitizedClasse = classe.replace(/\s+/g, '');
    const fileName = `${sanitizedCognome}_${sanitizedNome}_${sanitizedClasse}.pdf`;
    const filePath = path.join(__dirname, '../../storage/correzioni', fileName);

    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');
        fs.createReadStream(filePath).pipe(res);//Invia il PDF in streaming
    } else {
        res.status(404).send('File non trovato');
    }
});

module.exports = router;
