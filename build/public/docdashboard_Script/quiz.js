// quiz.js

//Fuzione per ottenere la lista qui quiz (file .csv) caricati sul server
function getQuizs() {
    $('#loading-overlay').show(); // Mostra overlay prima della richiesta
    fetch('/api/quiz')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('existingQuizs');
            select.innerHTML = "";
            data.quizzes.forEach(quiz => {
                const option = document.createElement('option');
                option.value = quiz.name;
                option.textContent = quiz.name;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            $('#loading-overlay').fadeOut(); // Nasconde overlay dopo la richiesta
        });
}

//Funzione per generare le box e creare dalla webapp un nuovo quiz (file.csv)
function generateQuizEditor() {
    $('#saveNewQuiz').show();
    $('#elseImport').hide();
    const numDomande = $('#numQ').val();
    const mainBox = $('#editQuiz');
    mainBox.html('');

    if (numDomande > 0) {
        for (let i = 0; i < numDomande; i++) {
            mainBox.append(`
                <div class="quest" data-id="quest_${i + 1}">
                    <h3>Domanda N ${i + 1}</h3>
                    <label for="text-area">
                        <textarea rows="4" cols="60" name="text-area" data-id="quest_${i + 1}" placeholder="Inserisci il testo della domanda"></textarea>
                    </label>
                    <div class="risposta">
                        <label for="risposta">Risposta Corretta</label><br>
                        <select name="risposta" class="risposta">
                            <option value="Vero">V</option>
                            <option value="Falso">F</option>
                        </select>
                    </div>
                </div>
            `);
        }
        mainBox.append('<hr>');
    } else {
        alert("Numero di domande minore o uguale a 0");
    }
}

function generateQuiz() {
    const questions = [];
    let flag = true;
    if ($('#newQuizSection #numQ').val() > 0) {
        $('#newQuizSection .quest').each(function (index) {
            const question = $(this).find('textarea').val();
            if (!question || question.trim() === '') {
                alert('Inserisci il testo della domanda N ' + $(this).data('id').split('quest_')[1]);
                flag = false;
            }
            const answer = $(this).find('select').val();
            questions.push({ index, question, answer });
        });

        if (!flag) return;

        const quizName = prompt("Inserisci il nome del quiz:", "quiz");
        if (quizName) {
            $('#loading-overlay').show(); // Mostra overlay prima della richiesta
            fetch('/api/save-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quizName, questions })
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    $('#existingTestSection,#newQuizSection').toggle();
                })
                .catch(error => {
                    console.error('Error:', error);
                })
                .finally(() => {
                    $('#loading-overlay').fadeOut(); // Nasconde overlay dopo la richiesta
                });
        }
    }
    else {
        return alert("Inserisci almeno una domanda");
    }
}

//Funzioni per importare un file .csv e salvarlo nel server
function validateFile() {
    const file = this.files[0];
    if (file) {
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (fileExt !== 'csv') {
            alert("Errore: puoi caricare solo file .csv!");
            $(this).val('');
            return;
        }
        const reader = new FileReader();
        $('#loading-overlay').show(); // Mostra overlay prima della richiesta
        
        reader.onload = function (e) {
            
            const contents = e.target.result;
            
            // Usa PapaParse per analizzare il CSV
            const parsedData = Papa.parse(contents, {
                delimiter: "", // Auto-rileva il separatore ("," o ";")
                header: false, // Il file NON ha un'intestazione
                skipEmptyLines: true, // Ignora righe vuote
                trimHeaders: true
            }).data;
        
            //console.log(parsedData); // Debug per vedere il parsing
        
            // Creazione della tabella HTML
            let table = '<table border="1">';
            table += `
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>Domanda</th>
                        <th>Risposta</th>
                    </tr>
                </thead>
                <tbody>
            `;
        
            parsedData.forEach(row => {
                if (row.length < 3) return; // Se la riga ha meno di 3 colonne, la saltiamo
        
                let index = parseInt(row[0], 10);
                let question = row[1].trim();
                let answer = row[2].trim() || "N/A"; // Se la risposta è vuota, mettiamo "N/A"
        
                table += `
                    <tr>
                        <td>${index}</td>
                        <td>${question}</td>
                        <td>${answer}</td>
                    </tr>
                `;
            });
        
            table += '</tbody></table>';
        
            $('#loading-overlay').hide(); // Nasconde overlay dopo la lettura
            // Inserisce la tabella nella pagina
            $('#csvPreview').html(table);

        };
        
        // Avvia la lettura del file
        reader.readAsText(file);

        $('#numQSection').hide();
        $('#importNewQuiz').show();
    }

}

function importQuiz(){
    const fileInput = document.getElementById('importQuiz');
    const file = fileInput.files[0];
    if (file) {
        console.log("File: ",file);
        const formData = new FormData();
        formData.append('file', file);
        console.log('Debug Form: ',formData);

        $('#loading-overlay').show(); // Mostra overlay prima della richiesta

        fetch('/api/import-csv', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            $('#existingTestSection,#newQuizSection').toggle();
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Unauthorized: Please log in");
            window.location.href = "/login";
        })
        .finally(() => {
            $('#loading-overlay').fadeOut(); // Nasconde overlay dopo la richiesta
        });
    }
}

//Funzione per inviare all'Alunno i dati del quiz selezionato
function sendQuiz(event) {
    event.preventDefault();
    const existingQuizName = $('#existingQuizs').val();
    const quizTitle = $('#quizTitle').val() || "Quiz";
    const minutes = parseInt($("#sendQuizForm #minutesInput").val(), 10) || 0;
    const seconds = parseInt($("#sendQuizForm #secondsInput").val(), 10) || 0;
    const quizPoint = {
        corretta: parseInt($('#corretta').val()),
        sbagliata: parseInt($('#sbagliata').val()),
        noRisp: parseInt($('#noRisp').val())
    };
    const selectedClass = $('#classeList').val();
    if (!selectedClass) {
        alert("Seleziona una classe.");
        return;
    }
    if (minutes < 0 || seconds < 0) {
        alert("Inserisci un valore valido di minuti e secondi.");
        return;
    }

    $.ajax({
        url: "/api/test/send",
        type: "POST",
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({
            testUrl: '/verifiche/quiz/' + existingQuizName,
            type: "Quiz",
            title: quizTitle,
            punteggi: quizPoint,
            classeDestinataria: selectedClass
        }),
        success: (data) => {
            alert(data.message);
            socket.emit('sendTest', data.quizData, data.quizInfo);
            socket.emit('startTimer', { minutes, seconds });
            $('#sendQuizForm').toggle("fast");
            $('#existingTestSection').hide();
            $('#verifica-incorso').show();
            liveInfo();
        },
        error: (err) => {
            console.error(err);
            alert("Unauthorized: Please log in");
            window.location.href = "/login";
        }
    });

    $('#classeList').val('');
    event.target.reset();
}

let flegQuiz = false;

const toggleQuizSection = () => {
    if (!flegQuiz) {
        getQuizs();
        flegQuiz = true;
    }
    $('#sendQuizForm').toggle("fast");
    $('#sendTestForm').hide("fast");
    flegTest = false;
}