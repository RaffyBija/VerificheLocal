## Documentazione del Progetto

### Parte 1: Descrizione dell'applicazione
L'applicazione è un sistema web progettato per gestire e condividere file in modo sicuro, con funzionalità di gestione di database di utenti. L'app si suddivide in due macro-funzionalità principali:

1. **Caricamento di file**: Gli utenti possono accedere a una piattaforma dove effettuano il login e successivamente caricare file sul server. Ogni file è associato all'utente che lo ha caricato, garantendo tracciabilità e sicurezza.

2. **Dashboard per la gestione degli utenti**: Una dashboard amministrativa consente di visualizzare, filtrare e gestire un elenco di utenti. Gli amministratori possono:
   - Visualizzare dettagli sugli utenti e il loro stato (online/offline).
   - Modificare i dati degli utenti attraverso un popup dedicato.
   - Eliminare utenti.
   - Filtrare i dati visualizzati in base a criteri specifici, come la classe.

### Parte 2: Dettagli Tecnici

#### Architettura Generale
Il progetto segue un'architettura client-server. Le pagine statiche vengono inviate dal server e interagiscono con un backend API per tutte le operazioni dinamiche, come il caricamento dei file, la gestione degli utenti e le autenticazioni.

- **Client**: Interfaccia utente sviluppata in HTML, CSS, JavaScript e jQuery.
- **Server**: Backend per la gestione delle richieste e delle operazioni sul database. Utilizza REST API per comunicare con il frontend.

#### Pagina di caricamento file

1. **Struttura**: La pagina utilizza un semplice form HTML per il caricamento dei file. L'utente seleziona un file dal proprio dispositivo e lo invia tramite un pulsante "Carica".

2. **Gestione del form**:
   - Il form utilizza JavaScript per inviare i dati tramite una richiesta `fetch` con il metodo POST all'endpoint `/upload`.
   - Prima dell'invio, viene impedito il comportamento di default del form (`e.preventDefault()`), garantendo un controllo completo sull'invio.
   - Se il caricamento è completato con successo, l'utente riceve un messaggio di conferma; in caso contrario, viene reindirizzato alla pagina di login.

3. **Autenticazione**: Un'API `/api/user` viene chiamata durante il caricamento della pagina per recuperare il nome utente e verificarne lo stato di autenticazione. Se l'autenticazione fallisce, l'utente è reindirizzato alla pagina di login.

#### Dashboard di gestione

1. **Struttura**: La pagina della dashboard utilizza una combinazione di HTML, CSS e jQuery per creare un'interfaccia interattiva. Comprende:
   - Una barra di navigazione per accedere a diverse sezioni.
   - Una tabella per visualizzare i dati degli utenti, con colonne per ID, Nome, Cognome, Classe, Username e Password.
   - Un filtro dinamico per visualizzare solo gli utenti di una classe specifica.
   - Pulsanti per modificare ed eliminare i record.

2. **Recupero dati**:
   - I dati sono ottenuti da un endpoint `/api/data` tramite una chiamata AJAX con jQuery. Il server restituisce un array JSON contenente le informazioni degli utenti.
   - I dati ricevuti vengono utilizzati per popolare dinamicamente la tabella.

3. **Filtraggio**:
   - Un filtro a discesa è generato dinamicamente in base ai dati ricevuti dal server.
   - Il filtraggio della tabella è implementato utilizzando il metodo `toggle()` di jQuery, che mostra o nasconde le righe in base alla classe selezionata.

4. **Modifica dei record**:
   - Un popup viene mostrato quando si clicca sul pulsante "Modifica" accanto a un record.
   - I dati esistenti del record sono precompilati nei campi del popup tramite una richiesta AJAX per recuperare i dettagli specifici.
   - Una volta confermate le modifiche, una richiesta POST viene inviata all'endpoint `/api/update` per aggiornare il record nel database.

5. **Eliminazione dei record**:
   - Un pulsante "Elimina" accanto a ogni record invia una richiesta DELETE all'endpoint `/api/delete/{id}`.
   - L'operazione è protetta da un prompt di conferma per evitare cancellazioni accidentali.

6. **Gestione password**:
   - Le password degli utenti sono mascherate nella tabella da un placeholder "**********".
   - Un pulsante consente di mostrare temporaneamente la password tramite una richiesta GET al server.
   - Dopo la visualizzazione, le password tornano automaticamente al loro stato mascherato.

#### Autenticazione e Sicurezza

- **Login e autenticazione**:
   - Il server verifica l'identità degli utenti tramite cookie di sessione.
   - Gli endpoint sono protetti da controlli di autenticazione; le richieste non autorizzate restituiscono uno stato HTTP 401.

- **Protezione delle credenziali**:
   - Le password sono memorizzate in forma hashata nel database per evitare compromissioni.
   - Le password visibili nella dashboard sono temporanee e vengono richieste solo se necessario.

#### User Experience (UX)

- **Interattività**: L'utilizzo di jQuery consente di aggiornare dinamicamente la tabella senza ricaricare la pagina.
- **Error Handling**: Ogni errore è gestito con messaggi appropriati, e gli utenti sono reindirizzati automaticamente in caso di sessioni scadute.
- **Accessibilità**: La struttura delle tabelle è ottimizzata per la navigazione e supporta i moderni standard di accessibilità.

---

Questa documentazione è una panoramica delle funzionalità e delle scelte tecniche che guidano lo sviluppo dell'applicazione. Per eventuali ulteriori dettagli o aggiornamenti, è possibile fare riferimento ai file sorgenti e alle API implementate nel backend.


