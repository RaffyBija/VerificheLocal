const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const paths = require('../config/paths'); // Importa i percorsi dal file di configurazione
const common = require('../midw/common');
const { getVerifica } = require("../api/test_api");
const { getDirectoryStructure, ensureDirectoryExists } = require('../utils/fileUtils'); // Funzioni di utilità

router.use('/uploads', express.static(paths.UPLOADS_DIR)); // Usa la costante per il percorso degli uploads


// Funzione per creare una configurazione Multer generica
const createMulterStorage = (destinationPath, filenameGenerator) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                ensureDirectoryExists(destinationPath(req, file)); // Verifica o crea la directory
                cb(null, destinationPath(req, file));
            } catch (err) {
                console.error('Errore durante la creazione della directory:', err);
                cb(new Error('Errore durante la creazione della directory'));
            }
        },
        filename: (req, file, cb) => {
            cb(null, filenameGenerator(req, file));
        }
    });
};

// Configurazione per il caricamento dei file utente
const userFileStorage = createMulterStorage(
    (req) => {
        const userClass = req.session.user.Classe || "Nobody";
        const userSurname = req.session.user.Cognome || "Surname";
        const userName = req.session.user.Nome || "Name";
        return paths.UPLOADS_DIR + `/${userClass}/${userSurname}_${userName}`;
    },
    (req, file) => {
        const extension = path.extname(file.originalname);
        const currentDate = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
        return `${currentDate}_${req.session.user.Cognome}_${req.session.user.Nome}${extension}`.replace(/\s+/g, '');
    }
);

// Configurazione per la consegna di allegati ad una verifica
const fileVerificaStorage = createMulterStorage(
    (req) => {
        const userClass = req.session.user.Classe || "Nobody";
        const userSurname = req.session.user.Cognome || "Surname";
        const userName = req.session.user.Nome || "Name";
        const today = new Date();
        const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        const testTitle = getVerifica();

        const baseUploadPath = path.join(paths.VERIFICHE_DIR, 'risultati', `${dateString}_${testTitle}_${req.session.user.Classe}`);
        return path.join(baseUploadPath, userClass, `${userSurname}_${userName}`);
    },
    (req, file) => {
        const extension = path.extname(file.originalname);
        const currentDate = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
        return `${currentDate}_${req.session.user.Cognome}_${req.session.user.Nome}${extension}`.replace(/\s+/g, '');
    }
);

// Configurazione per gli allegati
const attachmentsStorage = createMulterStorage(
    (req) => {
        const today = new Date();
        const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        const testTitle = req.query.title;
        const classe = req.query.classe;
        return `${paths.VERIFICHE_DIR}/tempAttachments_${dateString}_${testTitle}_${classe}`;
    },
    (req, file) => file.originalname
);

// Servi staticamente la cartella degli allegati
router.use('/attachments', express.static(paths.VERIFICHE_DIR));

// Configurazione per i file CSV
const csvStorage = createMulterStorage(
    () => `${paths.ROOT_DIR}/verifiche/quiz`,
    (req, file) => {
        const baseDir = `${paths.ROOT_DIR}/verifiche/quiz`;
        let originalName = file.originalname;
        let fileName = originalName;
        let filePath = path.join(baseDir, fileName);
        let counter = 1;

        while (fs.existsSync(filePath)) {
            const name = path.parse(originalName).name;
            const ext = path.parse(originalName).ext;
            fileName = `${name}(${counter})${ext}`;
            filePath = path.join(baseDir, fileName);
            counter++;
        }

        return fileName;
    }
);

// Configurazioni Multer
const upload = multer({ storage: fileVerificaStorage });
const uploadCsv = multer({ storage: csvStorage });
const uploadAttachments = multer({ storage: attachmentsStorage });

// Endpoint per inviare la pagina viewupload
router.get('/view', common.checkAuth, (req, res) => {
    if(req.session.user.Classe!== 'admin')
        return res.sendStatus(403);
    
    const baseDir = paths.STORAGE_DIR;
    const currentDir = req.query.dir ? path.join(baseDir, req.query.dir) : baseDir;

    // Verifica che la cartella esista
    if (!fs.existsSync(currentDir)) {
        return res.status(404).send('Cartella non trovata!');
    }

    // Ottieni la struttura della cartella corrente
    const structure = getDirectoryStructure(currentDir);
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
                <a href="/dbdashboard" id="home-button">🏠</a>
                <h1>Esplora risorse</h1>
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
});

// Route protetta per il caricamento dei file
router.post('/upload', common.checkAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nessun file caricato');
    }
    res.status(200).json({ message: 'File salvato con successo' });
});

// Route per importare gli allegati per una verifica
router.post('/api/import-attachments', common.checkAuth, uploadAttachments.array('attachments', 10), (req, res) => {
    try {
        if (req.session.user.Classe !== 'doc' && req.session.user.Classe !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accesso negato' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Nessun file caricato' });
        }

        res.status(200).json({ success: true, message: 'Allegati importati con successo' });
    } catch (error) {
        console.error('Errore durante l\'upload:', error);
        res.status(500).json({ success: false, message: 'Errore interno del server' });
    }
});
// Funzione per eliminare tutti i file temporanei
function clearTemporaryFiles() {
    const tempDirPrefix = "tempAttachments_";
    const tempDirPath = paths.VERIFICHE_DIR;

    if (!fs.existsSync(tempDirPath)) {
        console.log(`La directory temporanea non esiste: ${tempDirPath}`);
        return;
    }

    const filesAndDirs = fs.readdirSync(tempDirPath);
    filesAndDirs.forEach(item => {
        const fullPath = path.join(tempDirPath, item);
        if (item.startsWith(tempDirPrefix) && fs.statSync(fullPath).isDirectory()) {
            try {
                fs.rmSync(fullPath, { recursive: true, force: true });
                console.log(`Cartella temporanea rimossa: ${fullPath}`);
            } catch (err) {
                console.error(`Errore durante la rimozione della cartella temporanea: ${fullPath}`, err);
            }
        }
    });
}

// Elimina i file temporanei all'avvio del server
clearTemporaryFiles();

// Route per pulire le cartelle temporanee degli allegati
router.post('/delete-tempdir', (req, res) => {
    try {
        const today = new Date();
        const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        const testName = req.query.title;
        const classe = req.query.classe;
        const dirPrefix = "tempAttachments_";
        const tempDir = path.join(paths.VERIFICHE_DIR, `${dirPrefix}${dateString}_${testName}_${classe}`);

        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            res.status(200).json({ message: 'Cartella temporanea rimossa con successo' });
        } else {
            res.status(404).json({ message: 'Cartella temporanea non trovata' });
        }
    } catch (err) {
        console.error('Errore durante la rimozione della cartella temporanea:', err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

//Route protetta per importare quiz (file.csv)
router.post('/api/import-csv',common.checkAuth,uploadCsv.single('file'), (req,res)=>{
    if (req.session.user.Classe !== 'doc' && req.session.user.Classe !== 'admin') {
        return res.status(403).json({message: 'Accesso negato'});
    }

    if(!req.file){
        return res.status(400).json({message: 'No file uploaded'});
    }
    res.status(200).json({ message: 'File CSV importato con successo' });
});

// Route per ottenere la lista degli allegati
router.get('/api/list-attachments', common.checkAuth, (req, res) => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const testTitle = getVerifica();
    const relativDir = `tempAttachments_${dateString}_${testTitle}_${req.session.user.Classe}`;
    const baseDir = path.join(paths.VERIFICHE_DIR, relativDir);

    if (!fs.existsSync(baseDir)) {
        return res.status(404).json({ message: 'No attachments found' });
    }

    const attachments = getDirectoryStructure(baseDir).map(item => ({
        name: item.name,
        path: path.relative(paths.VERIFICHE_DIR, item.path) // Percorso relativo rispetto a VERIFICHE_DIR
    }));

    res.status(200).json(attachments);
});

router.get("/test-verifica", (req, res) => {
    const verifica = getVerifica();
    res.status(200).json({ verifica });
});

module.exports = router;