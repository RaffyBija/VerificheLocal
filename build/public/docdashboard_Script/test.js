// test.js


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

function getTests() {
    $('#loading-overlay').show();
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
        .catch(error => { console.error('Error:', error); })
        .finally(() => { $('#loading-overlay').fadeOut(); });
}

async function sendTest(event) {
    event.preventDefault();

    const existingTestName = $('#existingTests').val();
    const testTitle = $('#testTitle').val() || "Verifica";
    const minutes = parseInt($('#minutesInput').val(), 10) || 0;
    const seconds = parseInt($('#secondsInput').val(), 10) || 0;
    const selectedClass = $('#classeList').val();
    const attachments = $('#attachments')[0].files;

    if (!selectedClass) {
        return handleError("Seleziona una classe.");
    }

    if (minutes <= 0 || seconds < 0) {
        return handleError("Inserisci un valore valido di minuti e secondi.");
    }

    try {
        if (attachments.length > 0) {
            await uploadAttachments(attachments);
        }

        await sendTestData(existingTestName, testTitle, selectedClass, minutes, seconds);

        $('#classeList').val('');
        event.target.reset();
    } catch (error) {
        console.error('Errore:', error);
        alert('Si è verificato un errore durante l\'invio.');
    }
}

// **Funzione per caricare gli allegati**
async function uploadAttachments(files) {
    const formData = new FormData();
    for (let file of files) {
        formData.append('attachments', file);
    }

    console.log('File inviati:', files);

    const response = await fetch(`/api/import-attachments?classe=${encodeURIComponent($('#classeList').val())}&title=${encodeURIComponent($('#testTitle').val() || "Verifica")}`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    console.log('Server response:', data);

    if (!data.success) {
        throw new Error(data.message || 'Errore durante l\'upload degli allegati.');
    }

    alert('Allegati inviati con successo.');
}

// **Funzione per inviare i dati del test**
async function sendTestData(existingTestName, testTitle, selectedClass, minutes, seconds) {
    const response = await $.ajax({
        url: "/api/test/send",
        type: "POST",
        data: {
            testUrl: `/verifiche/${existingTestName}`,
            type: "Testo",
            title: testTitle,
            classeDestinataria: selectedClass
        }
    });

    alert(response.message);
    socket.emit('sendTest', 
        {testUrl: `/verifiche/${existingTestName}`}
       ,{ title: testTitle,
        type: "Testo",
        classeDestinataria: selectedClass}
    
    );
    socket.emit('startTimer', { minutes, seconds });

    $('#sendTestForm').toggle("fast");
    $('#existingTestSection').hide();
}

// **Gestione centralizzata degli errori**
function handleError(message) {
    alert(message);
    throw new Error(message);
}


let flegTest = false;

const toggleTestSection = () => {
    if (!flegTest) {
        getTests();
        flegTest = true;
    }
    $('#sendTestForm').toggle("fast");
    $('#sendQuizForm').hide("fast");
    flegQuiz = false;
}
