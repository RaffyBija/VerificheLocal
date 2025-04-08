const socket = io();

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
        $('#test-classe').text(data.classeDestinataria);
    }
});

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
                    <td>${row.user.Cognome}</td>
                    <td>${row.user.Nome}</td>
                    <td>${quizCompleted}</td>
                </tr>
            `);
        });
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

socket.on("updateTimer", (time) => {
    document.getElementById("display").innerText = formatTime(time);
});

socket.on("timerFinished", (testType) => {
    socket.emit('closeSession');
    alert("Tempo scaduto!");
    
    if(testType==="Quiz")
        testEnded();
});

