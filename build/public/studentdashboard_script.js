const socket = io();

let currentQuestionIndex = 0;
let quizData = [];
let typeTesto = false;

function goToUpload() {
    window.open('/upload', '_blank').focus();
}
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

function sendResult (){
    $.ajax({
        url:"/api/getResult",
        type:"POST",
        contentType: "application/json",
        data: JSON.stringify(quizData),
        success: function(data) {
            console.log(data.message);
        },
        error: function(err) {
            console.error(err);
        }
    });

    socket.emit("quizCompleted");
}

// Funzione per aggiungere un allegato alla lista
function addAttachment(filename, url) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = `${url}/${filename}`;
    link.textContent = filename;
    link.download = filename;
    listItem.appendChild(link);
    document.getElementById('attachments-list').appendChild(listItem);
}

// Funzione per ottenere gli allegati dalla route '/api/list-attachments'
function fetchAttachments() {
    $.ajax({
        url: '/api/list-attachments',
        method: 'GET',
        success: function(data) {
            console.log(data);
            data.forEach(function(attachment) {
                $('#attachments-list').show();
                addAttachment(attachment.name, attachment.path);
            });
        },
        error: function(error) {
            console.error('Errore nel recupero degli allegati:', error);
        }
    });
}




$(document).ready(() => {



    // Chiamata socket per indicare al server di essere entrati nel quiz
    socket.on('sessionOpened', () => {
        console.log("Session is Opened");
        socket.emit("enterInSession");
    });

    socket.emit("enterInSession");
    

    socket.on("updateTimer", (time) => {
        document.getElementById("display").innerText = formatTime(time);
    });
    
    socket.on("timerFinished", () => {
        $('#overlay #loading-popup').html("Tempo scaduto!");
        $('.sidenav ,#sendFile, #test-page, #attachments-list').hide();
        //Controllo se sono state risposte tutte le domande altrimenti completo con una stringa vuota
        quizData.forEach((question) => {
            if (!question.answer) {
                question.answer = '';
            }
        });
        if (!typeTesto) sendResult();
    }); 

    $('#overlay,#loading-popup').show();

    //Chiamata socket per ottenere i dati del quiz
    socket.on("testReceived", (data,info) => {
        console.log("Ricevuto URL del quiz:", data);
        if (data.testUrl) { 
            fetchAttachments();
            typeTesto = true; // Controllo se il server ha mandato un URL di un file HTML
            $('#overlay,#loading-popup').hide();  // Nasconde il caricamento
            $('#quiz-area').hide();  // Nasconde il quiz
            $('.sidenav ,#sendFile, #test-page').show();  // Mostra il pulsante per inviare il file
            
            $('#test-page').attr('src', data.testUrl);  // Imposta l'URL del file HTML
        } else if (Array.isArray(data) && data.length > 0) { // Controllo se il server ha mandato un array di oggetti del quiz
            $('#overlay,#loading-popup').hide();  // Nasconde il caricamento
            $('#quiz-area').html(`<h1>${title}</h1><hr> <div id="quiz-test"></div>`);  // Aggiunge il titolo del quiz
            $('#test-page, #sendFile,#attachments-list').hide();  // Nasconde il pulsante per inviare il file
            $('.sidenav ,#quiz-area').show();  // Mostra il quiz
            processQuizData(data);  // Processa i dati del quiz
        } else {
            $('#overlay,#loading-popup').show();  // Nasconde il caricamento
            $('.sidenav ,#sendFile, #test-page, #attachments-list').hide();
            console.error("URL non valido o file non supportato.");
        }
    });
});
//----------------- QUIZ ----------------


function startQuiz(data) {
    quizData = data;
    currentQuestionIndex = 0;
    showQuestion(currentQuestionIndex);
}
//  Funzione per mostrare la domanda
function showQuestion(index) {
    if (index >= quizData.length) {
        //console.log(quizData);
        $('#quiz-test').html( "<p>Quiz completato! 🎉</p>");
       sendResult();
        return;
    }

    $('#quiz-test').html(`
         <h2>Domanda ${index + 1}/${quizData.length}</h2>
         <p>${quizData[index].question}</p>
         <button class="vero" onclick="checkAnswer('Vero')">Vero</button>
         <button class="falso" onclick="checkAnswer('Falso')">Falso</button>
         <button class="next" onclick="checkAnswer('')">Prossima</button>
    `);
}
// Funzione per salvare la risposta selezionata
function checkAnswer(selectedAnswer) {
    quizData[currentQuestionIndex].answer = selectedAnswer;
    currentQuestionIndex++;
    showQuestion(currentQuestionIndex);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
// Funzione per processare i dati del quiz
function processQuizData(quizArray) {
    const quizData = quizArray.map(item => {
        return {
            index: item.index,
            question: item.question.trim()
        };
    });
    startQuiz(shuffle(quizData));
}

//Implementazione ricevimento file by Socket





