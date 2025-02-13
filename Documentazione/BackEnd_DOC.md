# Documentazione del Progetto

## 1. Descrizione Generale dell'Applicazione

Questa applicazione è un server web basato su Node.js che offre le seguenti funzionalità principali:

- **Gestione degli accessi**: Gli utenti possono registrarsi e accedere al sistema tramite un modulo di login. La gestione delle credenziali include la crittografia sicura delle password.
- **Gestione dei file**: Gli utenti autenticati possono caricare file su un server, con una struttura di cartelle personalizzata basata sulla classe e sul nome dell'utente.
- **Dashboard per amministratori**: Gli utenti con privilegi di amministratore possono accedere a una dashboard dove possono:
  - Visualizzare, modificare ed eliminare i dati presenti in un database MySQL.
  - Esplorare la struttura delle cartelle e visualizzare i file caricati dagli utenti.
- **Protezione tramite sessioni**: Il sistema utilizza sessioni per garantire che solo gli utenti autenticati possano accedere a funzionalità protette.

## 2. Dettagli Tecnici dell'Implementazione

### 2.1 Librerie Utilizzate

- **Express**: Framework utilizzato per la creazione del server e la gestione delle rotte.
- **Body-parser**: Middleware per il parsing delle richieste HTTP con payload JSON o URL-encoded.
- **Bcrypt e Crypto**: Utilizzati per la crittografia delle password, con un'implementazione basata sull'algoritmo AES-256-CBC.
- **Multer**: Middleware per la gestione dei file caricati dagli utenti.
- **Express-session**: Per la gestione delle sessioni degli utenti.
- **Dotenv**: Per la gestione delle variabili di ambiente.
- **FS e Path**: Per la gestione dei file e delle cartelle.

### 2.2 Struttura delle Rotte

#### Rotte Pubbliche
- `GET /`: Ritorna la pagina principale dell'applicazione.
- `GET /login`: Mostra la pagina di login.
- `GET /register`: Mostra la pagina di registrazione.

#### Rotte Protette
- `POST /register`: Permette agli utenti di registrarsi. Le password vengono crittografate prima di essere salvate nel database.
- `POST /login`: Verifica le credenziali dell'utente e crea una sessione autenticata.
- `GET /upload`: Mostra la pagina per il caricamento dei file (solo per utenti autenticati).
- `POST /upload`: Gestisce il caricamento dei file. I file vengono salvati in una struttura di cartelle personalizzata.
- `GET /view`: Permette agli amministratori di esplorare le cartelle e i file caricati dagli utenti.
- `GET /dbdashboard`: Mostra la dashboard per la gestione del database (solo per amministratori).
- `GET /api/data`: Ritorna l'elenco completo degli utenti nel database.
- `POST /api/update`: Aggiorna i dati di un utente specifico.
- `DELETE /api/delete/:id`: Elimina un utente dal database.
- `GET /api/password/:id`: Recupera e decrittografa la password di un utente specifico.

### 2.3 Gestione delle Sessioni

L'applicazione utilizza `express-session` per tracciare gli utenti autenticati. Le sessioni vengono salvate in un array (`inSessions`) per monitorare lo stato di autenticazione degli utenti. Ogni sessione include informazioni come:
- ID dell'utente
- Nome e cognome
- Stato di autenticazione

Le sessioni vengono distrutte al momento del logout, rimuovendo l'utente da `inSessions` e cancellando i cookie associati.

### 2.4 Crittografia delle Password

L'app utilizza l'algoritmo AES-256-CBC per crittografare e decrittografare le password. Le password sono memorizzate nel database in formato crittografato e confrontate in fase di login con una funzione personalizzata (`matchPassword`).

### 2.5 Gestione dei File

I file caricati vengono salvati in una struttura organizzata gerarchicamente:
- Livello 1: Classe dell'utente
- Livello 2: Nome e cognome dell'utente

Ogni file caricato include un timestamp nel nome per garantire l'unicità e tracciare la cronologia. La configurazione di `multer` definisce sia la destinazione che il formato del nome del file.

### 2.6 Interazione con il Database

Il database MySQL viene utilizzato per gestire:
- Informazioni sugli utenti (nome, cognome, username, password, classe).
- Tracciamento delle sessioni.

Le principali operazioni includono:
- Recupero di utenti (`findUser`, `findUserByID`).
- Aggiornamento e eliminazione di record.
- Verifica delle password crittografate.

### 2.7 Protezione delle Rotte

Le rotte protette utilizzano un middleware personalizzato (`checkAuth`) che verifica se l'utente è autenticato. Se non lo è, viene reindirizzato alla pagina di login.

### 2.8 Debug e Manutenzione

L'applicazione include endpoint per facilitare il debug:
- `GET /sessions`: Mostra tutte le sessioni attive.
- `GET /api/debug-session`: Restituisce i dettagli della sessione corrente.

### 2.9 Avvio del Server

Il server viene avviato sulla porta specificata nella variabile di ambiente `PORT` o, in assenza di essa, sulla porta 3000. L'indirizzo IP locale viene rilevato automaticamente per facilitare l'accesso.

---

Questa documentazione fornisce una panoramica completa del progetto. Se hai bisogno di ulteriori dettagli o di miglioramenti, fammelo sapere!


