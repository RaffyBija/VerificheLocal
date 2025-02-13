
let editorInstance;

const socket = io();

function generatePage() {
    const content = editorInstance.getData();
    const fileName = prompt("Inserisci il nome del file:");
    if (fileName) {
        $('#loading-overlay').show(); // Mostra overlay prima della richiesta
        fetch('/api/save-page', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileName, content: `<!DOCTYPE html><html lang='it'><head><meta charset='UTF-8'><title>${fileName}</title></head><body>${content}</body></html>` })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                getTests();
                $('#existingTestSection,#newTestSection').toggle();
            })
            .catch(error => {
                console.error('Error:', error);
            })
            .finally(() => {
                $('#loading-overlay').fadeOut(); // Nasconde overlay dopo la richiesta
            });
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
            questions.push({index, question, answer });
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
                body: JSON.stringify({quizName, questions})
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

function getTests() {
    $('#loading-overlay').show(); // Mostra overlay prima della richiesta
    fetch('/api/tests')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('existingTests');
            select.innerHTML = "";
            data.tests.forEach(test => {
                const option = document.createElement('option');
                option.value = test.name;
                option.textContent = test.name;
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

function getQuiz() {
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
function testEnded(){
    $('#verifica-incorso h2').html("Verifica Terminata");
    $('#verifica-incorso .spinner').hide();
    $('#btnTestTools').hide();
    $('#btnTestEndTools').show();
}
function testStarted(){
    $('#existingTestSection').hide();
    $('#verifica-incorso').show();
    $('#btnTestTools').show();
    $('#btnTestEndTools').hide();
}

socket.on("testInfo", (data) => {
    if(data.started){
        testStarted();
    }
    if(!(data.type === "" || data.title === "")){
        $('#test-name').text(data.title);
        $('#test-type').text(data.type);
    }
});

$(document).ready(() => {

    
    $('#importQuiz').val('');
    //Controllo estensione del file scelto
    $('#importQuiz').on("change", function() {
        var file = this.files[0]; // Prendi il file selezionato
        if (file) {
            var fileName = file.name; // Ottieni il nome del file
            var fileExt = fileName.split('.').pop().toLowerCase(); // Ottieni l'estensione

            if (fileExt !== 'csv') {
                alert("Errore: puoi caricare solo file .csv!");
                $(this).val(''); // Svuota il campo file
            }
        }
    });
    //Aggiungo l'evento a un pulsante per richiedere i dati dal server
    $("#refresh-tests").click(() => {
        getTests();
    });
    //Aggiungo l'evento a un pulsante per richiedere i dati dal server
    $("#refresh-quizs").click(() => {
        getQuiz();
    });

    $('#stopBtn').click(() => {
        $('#verifica-incorso .spinner').attr("stop", "yes");
        socket.emit("stopTimer");
    });

    $('#startBtn').click(() => {
        socket.emit('restoreTimer');
    });

    $('#reduce').click(() => {
        $('#mainInfoContent').toggle('fast');
    });
    //Evento per generare gli editor dei quiz
    $('#genera-editQuiz').click(() => {
        const numDomade = $('#numQ').val();
        const mainBox = $('#editQuiz');
        // Ripristino l'area editor
        $(mainBox).html('');
        if (numDomade > 0) {
            for (let i = 0; i < numDomade; i++) {
                $(mainBox).append(`
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
        }
        else {
            alert("Numero di domande minore o uguale a 0");
            return;
        }

    });

    ClassicEditor.create(document.querySelector('#editor'), editorConfig)
        .then(editor => {
            editorInstance = editor;
        })
        .catch(error => {
            console.error(error);
        });


        let flegTest = false;
        let flegQuiz = false;

        $('#testBtn').click(() => {
            if (!flegTest) {
                getTests();
                flegTest = true;
            }
            $('#sendTestForm').toggle("fast");
            $('#sendQuizForm').hide("fast");
            flegQuiz = false;
        });

        $('#quizBtn').click(() => {
            if (!flegQuiz) {
                getQuiz();
                flegQuiz = true;
            }
            $('#sendQuizForm').toggle("fast");
            $('#sendTestForm').hide("fast");
            flegTest = false;
        });

    // Dropdown menu per selezionare il tipo di verifica da creare
    $('#dropdownButton').click(function () {
        $('#dropdownMenu').toggle();
    });

    $('#new-test,#annullaT').click(function () {
        $('#newTestSection,#existingTestSection').toggle();
        $('#dropdownMenu').hide();
    });

    $('#new-quiz,#annullaQ').click(function () {
        $('#newQuizSection').find('input[type="number"]').val('0');
        $('#newQuizSection, #existingTestSection').toggle();
        $('#dropdownMenu').hide();
    });

    $(document).click(function (event) {
        if (!$(event.target).closest('#assessmentDropdown').length) {
            $('#dropdownMenu').hide();
        }
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    }
     //-------- IMPLEMENTAZIONE SOCKET.IO --------
     function liveInfo(){
        $('#live-info').empty().html(`
            <table>
                <thead>
                    <tr>
                        <th>COGNOME</th>
                        <th>NOME</th>
                        <th>Stato</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `);
    
        socket.emit('getSessionCache');
        
        // Rimuovi eventuali listener duplicati prima di aggiungerne uno nuovo
        socket.off('sendSessionCache').on('sendSessionCache', (data) => {
            const tbody = $('#live-info table tbody');
            tbody.empty(); // Svuota il corpo della tabella prima di riempirlo
    
            data.forEach(row => {
                const quizCompleted = row.quizCompleted ? "TERMINATO" : "IN CORSO";
                tbody.append(`
                    <tr>
                        <td>${row.userSurname}</td>
                        <td>${row.user}</td>
                        <td>${quizCompleted}</td>
                    </tr>
                `);
            });
        });
    }

    liveInfo();

    $('#newVerifica').click(()=>{
        $('#existingTestSection').toggle('fast');
        $('#verifica-incorso').hide();
    });

    

    $('#closeTest').click(()=>{
       const conferma = confirm("Sei sicuro di voler terminare l'attività in corso?");
       if(!conferma)
            return;

        socket.emit('closeSession');
        testEnded();

    });
    

    socket.on("updateTimer", (time) => {
        document.getElementById("display").innerText = formatTime(time);
    });
    
    socket.on("timerFinished", () => {
        socket.emit('closeSession');
        alert("Tempo scaduto!");
        testEnded();
    });

    

    
    // Gestisci l'invio del form per la verifica Testuale
    $('#sendTestForm').submit(function (event) {
        event.preventDefault();
        const existingTestName = $('#existingTests').val();
        const testTitle = $('#testTitle').val() || "Verifica";
        const minutes = parseInt(document.getElementById("minutesInput").value, 10) || 0;
        const seconds = parseInt(document.getElementById("secondsInput").value, 10) || 0;
        if (minutes <= 0 || seconds < 0) {
            alert("Inserisci un valore valido di minuti e secondi.");
            return;
        }
        //Aggiorno le informazioni nella API
        $.ajax({
            url: "/api/test/send",
            type: "POST",
            data: { testUrl: '/verifiche/' + existingTestName, type: "Testo" },
            success: function (data) {
                alert(data.message);
               
                socket.emit('sendTest', { testUrl: '/verifiche/' + existingTestName},{title: testTitle, type: "Testo"});
                socket.emit('startTimer', { minutes, seconds });
                $('#existingTestSection').toggle('fast');
            },
            error: function (err) {
                console.error(err);
            }
            
        });
        
        this.reset();
        
    });

    //Gestisci l'invio del form per il Quiz
    $('#sendQuizForm').submit(function (event) {
        event.preventDefault();
        const existingQuizName = $('#existingQuizs').val();
        const quizTitle = $('#quizTitle').val() || "Quiz";
        const minutes = parseInt($("#sendQuizForm #minutesInput").val(), 10) || 0;
        const seconds = parseInt($("#sendQuizForm #secondsInput").val(), 10) || 0;

        const quizPoint ={
            corretta : parseInt($('#corretta').val()),
            sbagliata : parseInt($('#sbagliata').val()),
            noRisp: parseInt($('#noRisp').val())
        }
        if (minutes <= 0 || seconds < 0) {
            alert("Inserisci un valore valido di minuti e secondi.");
            return;
        }
        //Aggiorno le informazioni nella API
        $.ajax({
            url: "/api/test/send",
            type: "POST",
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ 
                testUrl: '/verifiche/quiz/' + existingQuizName, 
                type: "Quiz", 
                title: quizTitle, 
                punteggi: quizPoint 
            }),
            success: (data)=> {
                alert(data.message);

                //Implementazione Socket
                //Invio i dati del quiz riccevuti al soccket
                socket.emit('sendTest', data.quizData,data.quizInfo);
                socket.emit('startTimer', { minutes, seconds });
                
                $('#existingTestSection').toggle('fast');
                $('#verifica-incorso').show();
                liveInfo();
            },
            error:  (err) => {
                console.error(err);
            }
        });  
        this.reset();  
    });

    $('#download-results').click(() => {
        $.ajax({
            url: '/api/download-results', // Assicurati di passare il titolo corretto
            method: 'GET',
            xhrFields: {
                responseType: 'blob' // Importante per gestire il file binario
            },
            success: function (data, status, xhr) {
                // Estrai il nome del file dall'header Content-Disposition (se presente)
                let filename = "risultati.zip";
                let disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    let matches = disposition.match(/filename="([^"]+)"/);
                    if (matches && matches.length > 1) {
                        filename = matches[1];
                    }
                }
        
                // Creiamo un link temporaneo per il download
                let url = window.URL.createObjectURL(data);
                let a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            },
            error: function (xhr, status, error) {
                console.error("Errore nel download:", error);
                alert("Errore durante il download del file.");
            }
        });
        
    });
});
