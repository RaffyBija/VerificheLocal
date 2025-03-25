const socket = io(); // Inizializza la connessione socket

let currentQuestionIndex = 0; // Indice della domanda corrente
let quizData = []; // Dati del quiz
let typeTesto = false; // Flag per indicare se il test è di tipo testo

$(document).ready(() => {
    initializeSocketEvents(); // Inizializza gli eventi del socket
    initializeUIEvents(); // Inizializza gli eventi dell'interfaccia utente
    socket.emit("enterInSession"); // Emette l'evento per entrare nella sessione
});

// Funzione per inizializzare gli eventi del socket
function initializeSocketEvents() {
    socket.on('sessionOpened', () => {
        console.log("Session is Opened");
        socket.emit("enterInSession"); // Emette l'evento per entrare nella sessione
    });

    socket.on("updateTimer", (time) => {
        document.getElementById("display").innerText = formatTime(time); // Aggiorna il timer
    });

    socket.on("timerFinished", handleTimerFinished); // Gestisce la fine del timer

    socket.on("testReceived", handleTestReceived); // Gestisce la ricezione del test
}

// Funzione per inizializzare gli eventi dell'interfaccia utente
function initializeUIEvents() {
    $('#overlay,#loading-popup').show(); // Mostra l'overlay e il popup di caricamento
}

// Funzione per gestire la fine del timer
function handleTimerFinished() {
    $('#overlay #loading-popup').html("Tempo scaduto!"); // Mostra il messaggio di tempo scaduto
    $('.sidenav ,#sendFile, #test-page, #allegati').hide(); // Nasconde gli elementi dell'interfaccia
    quizData.forEach((question) => {
        if (!question.answer) {
            question.answer = ''; // Imposta una risposta vuota per le domande senza risposta
        }
    });
    if (!typeTesto) sendResult(); // Invia i risultati se il test non è di tipo testo
}

// Funzione per gestire la ricezione del test
function handleTestReceived(data, info) {
    if (data.testUrl) {
        fetchAttachments(); // Recupera gli allegati
        typeTesto = true; // Imposta il flag per il test di tipo testo
        $('#overlay,#loading-popup').hide(); // Nasconde l'overlay e il popup di caricamento
        $('#quiz-area').hide(); // Nasconde l'area del quiz
        $('.sidenav ,#sendFile, #test-page').show(); // Mostra gli elementi dell'interfaccia
        $('#test-page').attr('src', data.testUrl); // Imposta l'URL del test
    } else if (Array.isArray(data) && data.length > 0) {
        $('#overlay,#loading-popup').hide(); // Nasconde l'overlay e il popup di caricamento
        $('#quiz-area').html(`<h1>${info}</h1><hr> <div id="quiz-test"></div>`); // Mostra le informazioni del quiz
        $('#test-page, #sendFile,#allegati').hide(); // Nasconde gli elementi dell'interfaccia
        $('.sidenav ,#quiz-area').show(); // Mostra l'area del quiz
        processQuizData(data); // Processa i dati del quiz
    } else {
        $('#overlay,#loading-popup').show(); // Mostra l'overlay e il popup di caricamento
        $('.sidenav ,#sendFile, #test-page, #allegati, #quiz-area').hide(); // Nasconde gli elementi dell'interfaccia
        console.error("URL non valido o file non supportato."); // Mostra un messaggio di errore
    }
}

// Funzione per formattare il tempo in minuti e secondi
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

// Funzione per inviare i risultati del quiz
function sendResult() {
    $.ajax({
        url: "/api/getResult",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(quizData),
        success: function(data) {
            console.log(data.message); // Mostra il messaggio di successo
        },
        error: function(err) {
            console.error(err); // Mostra un messaggio di errore
        }
    });

    socket.emit("quizCompleted"); // Emette l'evento di quiz completato
}

// Funzione per recuperare gli allegati
function fetchAttachments() {
    $.ajax({
        url: '/api/list-attachments',
        method: 'GET',
        success: function(data) {
            if (data) {
                $('#attachments-list').html(''); // Pulisce e elimina la lista di allegati presenti
                console.log(data); // Mostra i dati degli allegati
                $('#allegati').show(); // Mostra la sezione degli allegati
                data.forEach(function(attachment) {
                    addAttachment(attachment.name, attachment.path); // Aggiunge ogni allegato alla lista
                });
            }
        },
        error: function(error) {
            $('#allegati').hide(); // Nasconde la sezione degli allegati
            console.error('Errore nel recupero degli allegati:', error); // Mostra un messaggio di errore
        }
    });
}

// Funzione per aggiungere un allegato alla lista
function addAttachment(filename, relativePath) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = `/attachments/${relativePath}`; // Usa il percorso relativo servito dal server
    link.textContent = filename;
    link.download = filename;
    listItem.appendChild(link);
    document.getElementById('attachments-list').appendChild(listItem);
}

// Funzione per processare i dati del quiz
function processQuizData(quizArray) {
    quizData = quizArray.map(item => ({
        index: item.index,
        question: item.question.trim()
    }));
    startQuiz(shuffle(quizData)); // Avvia il quiz con i dati mescolati
}

// Funzione per avviare il quiz
function startQuiz(data) {
    quizData = data;
    currentQuestionIndex = 0; // Imposta l'indice della domanda corrente a 0
    showQuestion(currentQuestionIndex); // Mostra la prima domanda
}

// Funzione per mostrare una domanda
function showQuestion(index) {
    if (index >= quizData.length) {
        $('#quiz-test').html("<p>Quiz completato! 🎉</p>"); // Mostra il messaggio di quiz completato
        sendResult(); // Invia i risultati del quiz
        return;
    }

    $('#quiz-test').html(`
        <h2>Domanda ${index + 1}/${quizData.length}</h2>
        <p>${quizData[index].question}</p>
        <button class="vero" onclick="checkAnswer('Vero')">Vero</button>
        <button class="falso" onclick="checkAnswer('Falso')">Falso</button>
        <button class="next" onclick="checkAnswer('')">Prossima</button>
    `); // Mostra la domanda corrente e i pulsanti di risposta
}

// Funzione per controllare la risposta selezionata
function checkAnswer(selectedAnswer) {
    quizData[currentQuestionIndex].answer = selectedAnswer; // Salva la risposta selezionata
    currentQuestionIndex++; // Incrementa l'indice della domanda corrente
    showQuestion(currentQuestionIndex); // Mostra la prossima domanda
}

// Funzione per mescolare un array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Scambia gli elementi
    }
    return array; // Restituisce l'array mescolato
}





