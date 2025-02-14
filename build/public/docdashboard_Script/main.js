// main.js

$(document).ready(() => {
    // Carica i file esterni test.js e quiz.js
    $.getScript("/docdashboard_Script/test.js", function() {
        console.log("test.js è stato caricato correttamente.");
        // Ora carica anche quiz.js
        $.getScript("/docdashboard_Script/quiz.js", function() {
            console.log("quiz.js è stato caricato correttamente.");
            //Ora carico anche socket.js
            $.getScript("/docdashboard_Script/socket.js", ()=>{
                console.log("socket.js è stato caricato correttamente.");
                // Ora che entrambi i file sono caricati, esegui le funzioni dipendenti
                initializeEditor();
                setupEventListeners();
                liveInfo();
                getClassiList();
            }).fail(()=>{
                console.error("Errore nel caricamento di socket.js");
            })
        }).fail(function() {
            console.error("Errore nel caricamento di quiz.js");
        })
    }).fail(function() {
        console.error("Errore nel caricamento di test.js");
    });
});

function initializeEditor() {
    ClassicEditor.create(document.querySelector('#editor'), editorConfig)
        .then(editor => { editorInstance = editor; })
        .catch(error => { console.error(error); });
}
function closeTestSession() {
    const confirmClose = confirm("Sei sicuro di voler terminare l'attività in corso?");
    if (!confirmClose) return;

    socket.emit('closeSession');

    $.ajax({
        url: `/delete-tempdir?classe=${$('#test-classe').text()}&title=${$('#test-name').text()}`,
        type: "POST",
        success: (data)=>{
            console.log(data.message);
        },
        error: (xhr,status,error)=>{
            console.error("Errore nella cancellazione della cartella temporanea",error);
        }
    })
    testEnded();
}

/**
 * Imposta i listener per vari elementi dell'interfaccia utente.
 *
 * Listener degli eventi:
 * - `#importQuiz change`: Valida il file selezionato.
 * - `#refresh-tests click`: Recupera e aggiorna l'elenco dei test.
 * - `#refresh-quizs click`: Recupera e aggiorna l'elenco dei quiz.
 * - `#stopBtn click`: Emette un evento "stopTimer" al socket.
 * - `#startBtn click`: Emette un evento "restoreTimer" al socket.
 * - `#reduce click`: Alterna la visibilità del contenuto principale delle informazioni.
 * - `#genera-editQuiz click`: Genera l'editor del quiz.
 * - `#testBtn click`: Alterna la sezione dei test.
 * - `#quizBtn click`: Alterna la sezione dei quiz.
 * - `#dropdownButton click`: Alterna la visibilità del menu a discesa.
 * - `#new-test,#annullaT click`: Alterna la visibilità della nuova sezione di test e della sezione di test esistente.
 * - `#new-quiz,#annullaQ click`: Alterna la visibilità della nuova sezione di quiz e della sezione di test esistente.
 * - `document click`: Nasconde il menu a discesa se il clic è fuori dal menu a discesa di valutazione.
 * - `#newVerifica click`: Mostra la sezione di test esistente e nasconde la sezione di verifica in corso.
 * - `#closeTest click`: Chiude la sessione di test.
 * - `#sendTestForm submit`: Invia il modulo del test.
 * - `#sendQuizForm submit`: Invia il modulo del quiz.
 * - `#download-results click`: Avvia il download dei risultati.
 */
function setupEventListeners() {
    $('#attachments').val('');
    $('#importQuiz').val('');
    $('#importQuiz').on("change", validateFile);
    $('#refresh-tests').click(getTests);
    $('#refresh-quizs').click(getQuizs);
    $('#stopBtn').click(() => socket.emit("stopTimer"));
    $('#startBtn').click(() => socket.emit('restoreTimer'));
    $('#reduce').click(() => $('#mainInfoContent').toggle('fast'));
    $('#genera-editQuiz').click(generateQuizEditor);
    $('#testBtn').click(toggleTestSection);
    $('#quizBtn').click(toggleQuizSection);
    $('#dropdownButton').click(() => $('#dropdownMenu').toggle());
    $('#new-test,#annullaT').click(() => $('#newTestSection,#existingTestSection').toggle());
    $('#new-quiz,#annullaQ').click(() =>{
        $('#newQuizSection, #existingTestSection').toggle(); 
        $('#numQ').val('0');
        $('#editQuiz, #csvPreview').html('');
        $('#saveNewQuiz, #importNewQuiz').hide();
        $('#elseImport, #numQSection').show();
        $('#importQuiz').val('');
    });
    $(document).click(event => { if (!$(event.target).closest('#assessmentDropdown').length) $('#dropdownMenu').hide(); });
    $('#newVerifica').click(() => {
        $('#existingTestSection').show();
        $('#verifica-incorso').hide();
    });
    $('#closeTest').click(closeTestSession);
    $('#sendTestForm').on('submit', async function (event) {
        event.preventDefault();

        const submitButton = $('#sendTestButton'); // Assumendo che il pulsante abbia questo ID
        submitButton.prop('disabled', true).text('Invio in corso...');

        try {
            await sendTest(event);
        } catch (error) {
            console.error("Errore durante l'invio:", error);
        } finally {
            submitButton.prop('disabled', false).text('Invia Test');
        }
    });
    $('#sendQuizForm').submit(sendQuiz);
    $('#download-results').click(downloadResults);

    // Aggiungi listener per #attachments
    $('#attachments').on('change', function() {
        const fileList = this.files;
        const fileNames = Array.from(fileList).map(file => file.name);
        $('#fileList').empty(); // Pulisce la lista prima di aggiungere nuovi file
        fileNames.forEach(name => {
            $('#fileList').append(`<li>${name}</li>`);
        });
    });
}


const getClassiList = () => {
    $.ajax({
        url: '/api/classes',
        method: 'GET',
        success: function(data) {
            const $classeSelect = $('#classeList');
            $classeSelect.empty(); // Pulisce il select prima di aggiungere nuove opzioni
            $classeSelect.append(new Option('', '')); // Aggiunge una opzione vuota di default
            data.forEach(classe => {
                $classeSelect.append(new Option(classe));
            });
        },
        error: function(xhr, status, error) {
            console.error("Errore nel recupero delle classi:", error);
            alert("Errore durante il recupero delle classi.");
        }
    });
}

const downloadResults = ()=>{
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
}




