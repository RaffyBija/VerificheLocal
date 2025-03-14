// Importazione delle librerie necessarie
const express = require('express');
const { Server } = require("socket.io");
const socketAPI = require("./build/api/socketAPI"); // Importa le funzioni di Socket.io
const session = require('./build/midw/session').router; // Importa il middleware di sessione
const app = express();
const os = require('os');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Configurazione del middleware di sessione
app.use(session);

const view = require('./build/views/view');
app.use('/',view);

const route = require('./build/route/userGest');
app.use('/',route);

const apiTests = require('./build/api/test_api').router; // Importa le route API
app.use('/api', apiTests); // Utilizza le API delle verifiche

const apiRevisionView = require('./build/api/reviewAPI')
app.use('/api',apiRevisionView);

const apiDB = require('./build/api/db_api');//Importo le api del database
app.use('/api',apiDB);

const multerAPI = require('./build/route/multer');
app.use('/',multerAPI);

// Middleware
app.use(express.static('./build/public')); // Serve file statici
app.use('/verifiche',express.static('verifiche'));

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
    console.log(`Server is running on http://${address}:${PORT}`);
});

// Inizializza Socket.io direttamente sul server Express
const io = new Server(server);

// Passa l'oggetto io alla funzione che gestisce la logica della WebSocket
socketAPI(io,session);