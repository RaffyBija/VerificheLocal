const readline = require('readline');
const {getSessions} = require('./build/midw/sessionManager');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Funzione per arrestare il server
function shutdownServer() {
    console.log("🛑 Arresto del server...");
    process.exit(0);
}

// Stampa del messaggio di benvenuto
//attendo qualche secondo prima di visualizzare il messaggio
setTimeout(() => {
    console.log("🚀 Benvenuto nella CLI del server di Node.js");
    console.log("📌'shutdown' per chiudere il server.");
}, 1000);

// Funzione per visualizzare le sessioni attive
function showSessions() {
    console.log("👥 Sessioni attive:");
    const sessions = getSessions();
    if (sessions.length === 0) {
        console.log("Nessuna sessione attiva");
        return;
    }
    sessions.forEach(session => {
        console.table(session);
    });
}


const commandDescriptions = {
    exit: "Chiude il server.",
    quit: "Chiude il server.",
    shutdown: "Chiude il server.",
    sessions: "Mostra tutte le sessioni attive.",
};

// Gestione dei comandi da riga di comando
rl.on('line', (input) => {
    const arg = input.split(' ');
    const command = arg[0].toLocaleLowerCase();
    switch (command) {
        case 'exit':
        case 'quit':
        case 'shutdown':
            shutdownServer();
            break;
        case 'sessions':
            showSessions();
            break;
        case 'help':
            if (arg[1] && commandDescriptions[arg[1]]) {
                console.log(commandDescriptions[arg[1]]);
            } else {
                console.log("❌ Specificare un comando valido per ottenere aiuto.");
            }
            break;
        default:
            console.log("Comando non riconosciuto");
            break;
    }
});
