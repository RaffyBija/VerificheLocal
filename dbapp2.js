const mysql = require('mysql2/promise');
require('dotenv').config();

// Configurazione del pool di connessioni
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Numero massimo di connessioni contemporanee
    queueLimit: 0 // Nessun limite alla coda di richieste
});
// Test Connessione al database
(async () => {
    try {
        const [rows] = await pool.query('SELECT 1');
        console.log('Connessione al database riuscita:', rows);
    } catch (error) {
        console.error('Errore di connessione al database:', error);
    }
})();
// Funzione per trovare un utente
async function findUser(username, classe) {
    try {
        const [rows] = await pool.execute('SELECT ID,Cognome,Nome, Username, Password, Classe FROM Alunni WHERE Username = ? AND Classe = ?', [username, classe]);
        return rows.length > 0 ? rows[0] : null; // Restituisce il primo utente trovato o null
    } catch (error) {
        console.error('Errore nel database durante la ricerca dell\'utente:', error);
        throw error; // Propaga l'errore per una gestione futura
    }
}

// Funzione per salvare un nuovo utente
async function saveUser(nome, cognome, username, hashedPassword, classe) {
    try {
        const [result] = await pool.execute(
            `INSERT INTO Alunni (Nome, Cognome, Username, Password, Classe) VALUES (?, ?, ?, ?, ?)`,
            [nome, cognome, username, hashedPassword, classe]
        );
        return result.insertId; // Restituisce l'ID del nuovo utente
    } catch (error) {
        console.error('Errore nel database durante il salvataggio dell\'utente:', error);
        throw error;
    }
}
//Funzione per inviare tutti i dati del database
async function showUser() {
    try {
        const [users] = await pool.execute('SELECT * FROM Alunni ORDER BY CASE WHEN Classe = "admin" THEN 1 WHEN Classe = "doc" THEN 2 ELSE 3 END, Classe ASC, Cognome ASC, Nome ASC;');
        return users.length > 0 ? users : null;
    } catch (error) {
        console.error('Errore: ', error);
        throw error;
    }
}

//Funzione per aggiornare un campo
async function updateUser(user) {
    //console.log("Database response: ",user);
    try {
        await pool.execute(`UPDATE Alunni 
                   SET Cognome = ?, Nome = ?, Classe = ?, Username = ?, Password = ? 
                   WHERE id = ?`, [user.Cognome, user.Nome, user.Classe, user.Username, user.Password, user.ID]);
    } catch (err) {
        console.error('Errore: ', err);
        throw err;
    }
}

//funzione per ottenere dati specifici
async function findUserByID(id) {
    try {
        const [rows] = await pool.execute('SELECT * FROM Alunni WHERE ID = ?', [id]);
        return rows.length > 0 ? rows[0] : null; // Restituisce il primo utente trovato o null
    } catch (err) {
        console.error("Errore: ", err);
        throw err;
    }

}

//Funzione per eliminare un record
async function deleteUser(id) {
    try {
        await pool.execute('DELETE FROM Alunni WHERE ID = ?', [id]);
    } catch (err) {
        console.error("Errore nel database durante l'eliminazione di un record: ", err);
        throw err;

    }
}

//Funzione per ottenere una password
async function findPassword(id) {
    try {
        const [password] = await pool.execute('SELECT Password FROM Alunni WHERE ID = ?', [id]);
        return password.length > 0 ? password[0] : null;
    } catch (err) {
        console.error("Errore durante la ricerca della password nel database: ", err);
        throw err;
    }
}

//Funzione per ottenere la lista di classi esistenti
async function getClassi() {
    try {
        const [rows] = await pool.execute('SELECT DISTINCT Classe FROM Alunni WHERE Classe NOT IN ("admin", "doc")');
        return rows.map(row => row.Classe);
    } catch (err) {
        console.error("Errore durante l'ottenimento delle classi dal database: ", err);
        throw err;
    }
}
module.exports = { findUser, saveUser, showUser, updateUser, findUserByID, deleteUser, findPassword, getClassi};
