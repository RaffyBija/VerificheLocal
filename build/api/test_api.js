const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');  // Libreria per generare e gestire un file .pdf
const archiver = require('archiver');   // Libreria per creare file .zip
const Papa = require('papaparse');      // Parser file CSV
const paths = require('../config/paths'); // Importa i percorsi dal file di configurazione
const { ensureDirectoryExists } = require('../utils/fileUtils'); // Funzione di utilità

let verifica = {};

// Endpoint per ottenere le verifiche esistenti
router.get('/tests', (req, res) => {
    const verificheDir = path.join(paths.VERIFICHE_DIR, 'testi'); // Usa il percorso centralizzato aggiornato
    fs.readdir(verificheDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Errore durante la lettura delle verifiche' });
        }
        const htmlFiles = files.filter(file => path.extname(file) === '.html');
        const tests = htmlFiles.map((file, index) => ({ id: index + 1, name: file }));
        res.status(200).json({ tests });
    });
});

// Endpoint per ottenere la lista di quiz esistenti
router.get('/quiz', (req, res) => {
    const quizDir = path.join(paths.VERIFICHE_DIR, 'quiz'); // Usa il percorso centralizzato
    fs.readdir(quizDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Errore durante la lettura dei quiz' });
        }
        const csvFiles = files.filter(file => path.extname(file) === '.csv');
        const quizzes = csvFiles.map((file, index) => ({ id: index + 1, name: file }));
        res.status(200).json({ quizzes });
    });
});

// Route per salvare la verifica generata dal docente
router.post('/save-page', (req, res) => {
    if (req.session.classe !== 'doc' && req.session.classe !== 'admin') {
        return res.status(403).send('Accesso negato');
    }

    const { fileName, content } = req.body;
    const sanitizedFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(paths.VERIFICHE_DIR,'testi', `${sanitizedFileName}.html`);

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error('Errore durante il salvataggio della pagina:', err);
            return res.status(500).send('Errore durante il salvataggio della pagina');
        }
        res.status(200).json({ message: 'Pagina salvata con successo' });
    });
});

// Route per salvare un quiz generato dal docente
router.post('/save-quiz', (req, res) => {
    if (req.session.classe !== 'doc' && req.session.classe !== 'admin') {
        return res.status(403).send('Accesso negato');
    }

    const { quizName, questions } = req.body;
    const sanitizedFileName = quizName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(paths.VERIFICHE_DIR, 'quiz', `${sanitizedFileName}.csv`);

    const csvContent = questions.map(q => `${q.index};${q.question};${q.answer}`).join('\r\n');

    fs.writeFile(filePath, csvContent, (err) => {
        if (err) {
            console.error('Errore durante il salvataggio del quiz:', err);
            return res.status(500).send('Errore durante il salvataggio del quiz');
        }
        res.status(200).json({ message: 'Quiz salvato con successo' });
    });
});

// Endpoint per inviare una verifica esistente
router.post('/test/send', (req, res) => {
    if (req.session.classe !== 'doc' && req.session.classe !== 'admin') {
        return res.status(403).json({ message: 'Accesso negato' });
    }

    if (req.body.type === "Quiz") {
        verifica = { ...req.body }; // Memorizzo i dati della verifica
        verifica.punteggi.totale = 0;
        const quizFilePath = path.join(paths.VERIFICHE_DIR, req.body.testUrl); // Usa il percorso centralizzato
        fs.readFile(quizFilePath, "utf-8", (err, data) => {
            if (err) {
                console.error('Errore durante la lettura del quiz:', err);
                return res.status(500).send('Errore durante la lettura del quiz');
            }

            const parsed = Papa.parse(data, {
                delimiter: "", // Auto-rileva il separatore
                header: false,
                skipEmptyLines: true,
                trimHeaders: true
            });

            if (!parsed.data || parsed.data.length === 0) {
                console.error("Errore: Nessun dato parsato dal CSV.");
                return res.status(500).send('Errore nel parsing del quiz');
            }

            verifica.quizData = parsed.data.map(row => {
                verifica.punteggi.totale += verifica.punteggi.corretta;
                if (row.length < 3) return null;

                return {
                    index: parseInt(row[0], 10),
                    question: row[1].trim(),
                    answer: row[2]?.trim() || "N/A"
                };
            }).filter(item => item !== null);

            res.status(200).json({
                message: 'Verifica inviata!',
                quizData: verifica.quizData.map(quiz => ({ index: quiz.index, question: quiz.question })),
                quizInfo: { type: verifica.type, title: verifica.title, classeDestinataria: verifica.classeDestinataria }
            });
        });
    } else if (req.body.type === "Testo") {
        verifica = { ...req.body };
        res.status(200).json({ message: 'Verifica inviata!' });
    }
});

// Endpoint per ottenere i dati del quiz e generare un correttore
router.post("/getResult", (req, res) => {
    const quizResult = req.body;
    let userTotPoint = 0;

    const results = quizResult.map(result => {
        const correctAnswer = verifica.quizData.find(ca => ca.index === parseInt(result.index));

        if (!(result.answer === '') && correctAnswer) {
            if (result.answer === correctAnswer.answer) {
                userTotPoint += verifica.punteggi.corretta;
            } else {
                userTotPoint -= verifica.punteggi.sbagliata;
            }
        }

        return {
            ...result,
            correct: result.answer === (correctAnswer ? correctAnswer.answer : '') ? "Corretta" : "Sbagliata",
        };
    });

    results.sort((a, b) => parseInt(a.index) - parseInt(b.index));

    const doc = new PDFDocument();
    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const dirPath = path.join(paths.CORRECTIONS_DIR, `${dateString}_${verifica.title}_${req.session.classe}`);

    ensureDirectoryExists(dirPath);

    const pdfFilePath = path.join(dirPath, `${(req.session.userSurname).replace(/[^a-z0-9]/gi, '_') || ""}_${req.session.user}_results.pdf`);
    const writeStream = fs.createWriteStream(pdfFilePath);

    doc.pipe(writeStream);
    doc.fontSize(10).text(`Alunno: ${req.session.userSurname} ${req.session.user}  Classe: ${req.session.classe}`, { align: 'right', oblique: true });
    doc.moveDown();
    doc.fontSize(16).text('Risultati del Quiz ' + verifica.title, { align: 'center' });
    doc.moveDown();

    results.forEach(result => {
        doc.fontSize(12).text(`Domanda ${(result.index + 1)}: ${result.question}`);
        doc.text(`Risposta data: ${result.answer}`);
        doc.text(`Risposta corretta: ${result.correct}`);
        doc.moveDown();
    });

    doc.fontSize(16).text(`Punteggio ottenuto: ${userTotPoint}/${verifica.punteggi.totale}`, { align: 'right' });
    doc.end();
});

// Endpoint per ottenere un file zip contenente i risultati della verifica svolta
router.get('/download-results', (req, res) => {
    if (!req.session || !req.session.classe) {
        return res.status(400).send('Classe non specificata nella sessione');
    }

    const today = new Date();
    const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const verificaTitle = req.query.title || "verifica"; // Assicurati che `verifica.title` sia definito
    const dirPath = path.join(paths.VERIFICHE_DIR, 'risultati', `${dateString}_${verifica.title}_${verifica.classeDestinataria}`);

    if (!fs.existsSync(dirPath)) {
        return res.status(404).send('Nessun risultato trovato');
    }

    const zipFilePath = path.join(paths.VERIFICHE_DIR, 'risultati', `${dateString}_${verifica.title}_${verifica.classeDestinataria}.zip`);

    // Creazione del file ZIP
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        // Ora il file ZIP è pronto per il download
        res.download(zipFilePath, (err) => {
            if (err) {
                console.error('Errore durante il download:', err);
                res.status(500).send('Errore durante il download del file zip');
            } else {
                // Elimina il file ZIP dopo il download (IMPORTANTE: dopo la risposta)
                fs.unlink(zipFilePath, (err) => {
                    if (err) console.error('Errore nell\'eliminazione del file zip:', err);
                });
            }
        });
    });

    archive.on('error', (err) => {
        console.error('Errore durante la creazione del file zip:', err);
        res.status(500).send('Errore durante la creazione del file zip');
    });

    archive.pipe(output);
    archive.directory(dirPath, false);
    archive.finalize();
});

// Funzione per ottenere sempre l'oggetto aggiornato
module.exports = { router, getVerifica: () => verifica.title, getClasseDestinataria: () => verifica.classeDestinataria };
