const express = require('express');
const router = express.Router();
const fs = require('fs'); // Modulo per lavorare con il file system
const multer = require('multer');
const path = require('path');
const common = require('../midw/common');
const {getVerifica} = require("../api/test_api");


router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configurazione di Multer per il caricamento dei file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Nome della classe e dell'utente
        const userClass = req.session.classe || "Nobody"; // classe dell'utente
        const userSurname = req.session.userSurname || "Surname"; // cognome dell'utente
        const userName = req.session.user || "Name"; // nome dell'utente

        // Percorso della cartella uploads (una directory sopra quella corrente)
        const baseUploadPath = path.join(__dirname, '..', 'uploads');
        
        // Costruisce il percorso dinamico per la cartella
        const classFolder = path.join(baseUploadPath, userClass);
        const userFolder = path.join(classFolder, `${userSurname}_${userName}`);

        // Verifica se la cartella per la classe esiste, altrimenti creala
        try {
            // Crea la cartella per la classe se non esiste
            fs.mkdirSync(classFolder, { recursive: true });

            // Crea la cartella per l'utente se non esiste
            fs.mkdirSync(userFolder, { recursive: true });
        } catch (err) {
            console.error('Errore durante la creazione delle cartelle:', err);
            return cb(new Error('Errore durante la creazione delle cartelle'));
        }

        // Imposta la destinazione finale del file
        cb(null, userFolder);
    },
    filename: (req, file, cb) => {
        // Estrai l'estensione del file
        const extension = path.extname(file.originalname);

        // Ottieni la data corrente in formato YYYY-MM-DD_HH-mm-ss
        const currentDate = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];

        // Costruisci il nome del file
        const fileName = `${currentDate}_${req.session.userSurname}_${req.session.user}${extension}`;

        // Rimuovi gli spazi nel nome del file
        const cleanFileName = fileName.replace(/\s+/g, '');

        cb(null, cleanFileName);
    }
});

// Configurazione di Multer per il caricamento dei file
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Nome della classe e dell'utente
        const userClass = req.session.classe || "Nobody"; // classe dell'utente
        const userSurname = req.session.userSurname || "Surname"; // cognome dell'utente
        const userName = req.session.user || "Name"; // nome dell'utente
        const today = new Date();
        const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        const testTitle = getVerifica();

        // Percorso della cartella uploads (una directory sopra quella corrente)
        const baseUploadPath = path.join(__dirname, '../../verifiche','/risultati', `${dateString}_${testTitle}_${req.session.classe}`);
         
        
        // Costruisce il percorso dinamico per la cartella
        const classFolder = path.join(baseUploadPath, userClass);
        const userFolder = path.join(classFolder, `${userSurname}_${userName}`);

        // Verifica se la cartella per la classe esiste, altrimenti creala
        try {
            //Crea la cartella per la verifica se non esiste
            fs.mkdirSync(baseUploadPath,{recursive: true});

            // Crea la cartella per la classe se non esiste
            fs.mkdirSync(classFolder, { recursive: true });

            // Crea la cartella per l'utente se non esiste
            fs.mkdirSync(userFolder, { recursive: true });
        } catch (err) {
            console.error('Errore durante la creazione delle cartelle:', err);
            return cb(new Error('Errore durante la creazione delle cartelle'));
        }

        // Imposta la destinazione finale del file
        cb(null, userFolder);
    },
    filename: (req, file, cb) => {
        // Estrai l'estensione del file
        const extension = path.extname(file.originalname);

        // Ottieni la data corrente in formato YYYY-MM-DD_HH-mm-ss
        const currentDate = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];

        // Costruisci il nome del file
        const fileName = `${currentDate}_${req.session.userSurname}_${req.session.user}${extension}`;

        // Rimuovi gli spazi nel nome del file
        const cleanFileName = fileName.replace(/\s+/g, '');

        cb(null, cleanFileName);
    }
});

//Configurazione multer per il caricamento degli allegati
const attachmentsStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        const today = new Date();
        const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        const testTitle = req.query.title;
        const classe = req.query.classe;
        const baseDir = path.join(__dirname, '../../verifiche', `tempAttachements_${dateString}_${testTitle}_${classe}`);
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }
        console.log("Attachement dir: ",baseDir);
        router.use("/",express.static(baseDir));

        cb(null, baseDir);
    },
    filename:(req,file,cb)=>{
        cb(null, file.originalname);
    }

});

//Configurazione di multer per la memorizzazione dei file CSV.
const csvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const baseDir = path.join(__dirname, "..", "..", "verifiche", "quiz");

        if (!fs.existsSync(baseDir)) {
            return cb(new Error("Errore nel server"));
        }
        cb(null, baseDir);
    },

    filename: (req, file, cb) => {
        const baseDir = path.join(__dirname, "..", "..", "verifiche", "quiz");
        let originalName = file.originalname;
        let fileName = originalName;
        let filePath = path.join(baseDir, fileName);
        let counter = 1;
        // Controlla se il file esiste già e modifica il nome del file di conseguenza
        while (fs.existsSync(filePath)) {
            const name = path.parse(originalName).name;
            const ext = path.parse(originalName).ext;
            fileName = `${name}(${counter})${ext}`;
            filePath = path.join(baseDir, fileName);
            counter++;
        }
        
        cb(null, fileName);
    }
});

const upload = multer({ storage: fileStorage });
const uploadCsv = multer({ storage: csvStorage });
const uploadAtta = multer ({storage: attachmentsStorage});


// Funzione per ottenere la lista delle cartelle e dei file
const getDirectoryStructure = (dirPath) => {
    const result = [];
    const fullPath = path.join(__dirname,'../../'+dirPath);
    try {
        const items = fs.readdirSync(fullPath);

        items.forEach(item => {
            
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                result.push({ type: 'directory', name: item, path: dirPath });
            } else {
                result.push({ type: 'file', name: item, path: `${dirPath}/${item}` });
            }
        });
    } catch (err) {
        console.error('Errore durante la lettura della directory:', err);
        return [];
    }
    return result;
};

// Endpoint per inviare la pagina viewupload
router.get('/view', common.checkAuth, (req, res) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    const baseDir = path.join(__dirname, '../uploads');
    const currentDir = req.query.dir ? path.join(baseDir, req.query.dir) : baseDir;

    // Verifica che la cartella esista
    if (!fs.existsSync(currentDir)) {
        return res.status(404).send('Cartella non trovata!');
    }

    // Ottieni la struttura della cartella corrente
    const structure = getDirectoryStructure(currentDir);

    // Prepara il contenuto HTML
    let html = '<head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title></title> <link rel="stylesheet" href="style.css" </head>'
    html += `<a href="/dbdashboard" font-size ="large"> 🏠 DBDashboard</a> <h1>Contenuto della Cartella</h1>  `;
    let parentDir = req.query.dir ? path.dirname(req.query.dir) : ''; // Indirizzo per tornare indietro

    html += `<p><a href="?dir=${parentDir}"> <span font-size="large">↰</span> Torna alla cartella precedente</a></p>`;

    html += '<ul>';
    structure.forEach(item => {
        if (item.type === 'directory') {
            html += `<li><a href="?dir=${path.relative(baseDir, item.path)}">📂${item.name}/</a></li>`;
        } else {
            html += `<li><a href="../uploads/${path.relative(baseDir, item.path)}" target="_blank">${item.name}</a></li>`;
        }
    });
    html += '</ul>';

    res.status(200).send(html);
});

// Route protetta per il caricamento dei file
router.post('/upload', common.checkAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    // Salva le informazioni del file nel database o processalo
    res.status(200).json({ message: 'File salvato con successo' });
});

// Route per importare gli allegati per una verifica
router.post('/api/import-attachments', common.checkAuth, uploadAtta.array('attachments', 10), (req, res) => {
    try {
        if (req.session.classe !== 'doc' && req.session.classe !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accesso negato' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        res.status(200).json({ success: true, message: 'Allegati importati con successo' });
    } catch (error) {
        console.error('Errore durante l\'upload:', error);
        res.status(500).json({ success: false, message: 'Errore interno del server' });
    }
});





//Route protetta per importare quiz (file.csv)
router.post('/api/import-csv',common.checkAuth,uploadCsv.single('file'), (req,res)=>{
    if (req.session.classe !== 'doc' && req.session.classe !== 'admin') {
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
    const relativDir = `/verifiche/tempAttachements_${dateString}_${testTitle}_${req.session.classe}`
    const baseDir = path.join(__dirname,'../../'+relativDir);
    console.log("list attachements dir: ",baseDir);
    if (!fs.existsSync(baseDir)) {
        return res.status(404).json({ message: 'No attachments found' });
    }

    const attachments = getDirectoryStructure(relativDir);
    res.status(200).json(attachments);
});

router.get("/test-verifica",(req,res)=>{
    const verifica = getVerifica();
    console.log("Test debug porcaccio lo zio:",verifica);
    res.status(200).json({verifica});
});

module.exports = router;