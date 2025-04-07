// Importazione delle librerie necessarie
const express = require('express');
const { Server } = require("socket.io");
const path = require('path');
const paths = require('./build/config/paths'); // Importa i percorsi configurati
const socketAPI = require("./build/api/socketAPI"); // Importa le funzioni di Socket.io
const session = require('./build/midw/session').router; // Importa il middleware di sessione
const app = express();
const os = require('os');
require('dotenv').config();

const cli = require('./CLI');

const PORT = process.env.PORT || 5000;

// Configurazione del middleware di sessione
app.use(session);

// Route per le viste
const view = require(path.join(paths.BUILD_DIR, 'views', 'view'));
app.use('/', view);

// Route per la gestione degli utenti
const route = require(path.join(paths.BUILD_DIR, 'route', 'userGest'));
app.use('/', route);

// API per le verifiche
const apiTests = require(path.join(paths.BUILD_DIR, 'api', 'test_api')).router;
app.use('/api', apiTests);

// API per la revisione delle verifiche
const apiRevisionView = require(path.join(paths.BUILD_DIR, 'api', 'reviewAPI'));
app.use('/api', apiRevisionView);

// API per il database
const apiDB = require(path.join(paths.BUILD_DIR, 'api', 'db_api'));
app.use('/api', apiDB);

// API per l'upload dei file
const multerAPI = require(path.join(paths.BUILD_DIR, 'route', 'multer'));
app.use('/', multerAPI);

// Middleware per servire file statici
app.use(express.static(paths.PUBLIC_DIR)); // Serve file statici dalla directory public
app.use('/verifiche', express.static(paths.VERIFICHE_DIR)); // Serve le verifiche dalla directory configurata


//TEST REACT
app.use(express.static(paths.FEBUILD_DIR)); // Serve file statici dalla directory frontend/build
app.get('*', (req,res)=>{
    res.sendFile(path.join(paths.FEBUILD_DIR, 'index.html'));
});

// Avvio del server
const server = app.listen(PORT, () => {
    const networkInterfaces = os.networkInterfaces();
    let myip;
    for (const interfaceName in networkInterfaces) {
        const interfaceDetails = networkInterfaces[interfaceName];

        for (const detail of interfaceDetails) {
            // Controllo solo IPv4 ed escludo indirizzi interni come 127.0.0.1
            if (detail.family === 'IPv4' && !detail.internal) {
                myip = detail.address;
            }
        }
    }
    const address = myip || 'localhost';
    console.clear();
    console.log(`Server is running on http://${address}:${PORT}`);
});

// Inizializza Socket.io direttamente sul server Express
const io = new Server(server);

// Passa l'oggetto io alla funzione che gestisce la logica della WebSocket
socketAPI(io, session);