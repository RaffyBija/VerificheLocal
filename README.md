# VeriLoc

**VeriLoc** è una web-app per la gestione centralizzata di verifiche scolastiche, pensata per docenti e studenti.

## Scopo

- **Docenti**  
  - Creano e configurano verifiche (testo HTML o quiz V/F)  
  - Definiscono durata e allegati  
  - Avviano la sessione in tempo reale via WebSocket  
  - Monitorano in diretta chi ha partecipato e i progressi degli studenti

- **Studenti**  
  - Si collegano alla propria classe  
  - Ricevono in tempo reale l’avvio della prova  
  - Visualizzano il timer sincronizzato dal server  
  - Compilano quiz o inviano il proprio elaborato testo  
  - Consegna unica, bloccata sia lato client che lato server

## Caratteristiche principali

**Autenticazione e ruoli**: `admin`, `teacher`, `student`
**Dashboard**:
  - `DBDashboard` per amministratori (gestione utenti, classi, materie)
  - `DocDashboard` per docenti (creazione e lancio verifiche)
  - `VerificaStudente` per studenti (partecipazione, timer, invio risposte/file)
**WebSocket**:  
  - Broadcast di eventi (`examStarted`, `updateTimer`, `studentJoined`, ecc.)  
  - Sincronizzazione timer e stato esame  
  - Live results (studenti connessi e punteggi in tempo reale)
- **Single-submit enforcement**:  
  - Il server rifiuta eventuali seconde consegne  
  - Il client blocca il form dopo l’invio

---

> **Stack Tecnologico**  
> Frontend: React + Socket.IO-client  
> Backend: Node.js + Express + Socket.IO + MySQL  

