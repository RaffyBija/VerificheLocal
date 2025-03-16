$(document).ready(() => {
    initializeUIEvents(); // Inizializza gli eventi dell'interfaccia utente
    fetchData(); // Carica i dati all'avvio
});

// Funzione per visualizzare la tabella
async function fetchData() {
    try {
        $('#loading-overlay').show(); // Mostra overlay prima della richiesta
        const data = await $.get('/api/data');
        renderTable(data);
        populateClassSelect(data);
    } catch (err) {
        handleError(err);
    } finally {
        $('#loading-overlay').fadeOut(); // Nasconde overlay dopo la richiesta
    }
}

// Funzione per renderizzare la tabella
function renderTable(data) {
    let elento_classi = new Set();
    $("tbody").empty(); // Pulisco/Svuoto la tabella

    data.forEach(row => {
        elento_classi.add(row.Classe);

        const tr = $(`<tr class="${row.Classe}" data-id="${row.ID}">`);
        const statusClass = row.isOnline ? 'online' : 'offline';
        tr.append(`<td><span class="status-icon ${statusClass}" data-id="${row.ID}"></span></td>`);

        tr.append(`
            <td>${row.ID}</td>
            <td>${row.Cognome}</td>
            <td>${row.Nome}</td>
            <td>${row.Classe}</td>
            <td>${row.Username}</td>
            <td>
                <span class="password-hidden" data-id="${row.ID}">**********</span>
                <button class="hidden-psw-btn" data-id="${row.ID}">🙈</button>
            </td>
            <td>
                <button class="edit-btn" data-id="${row.ID}">✏️ Modifica</button>
                <button class="delete-btn" data-id="${row.ID}">🗑️ Elimina</button>
            </td>
        `).hide(); // Li nascondo come valore di default

        $('tbody').append(tr);
    });
}

// Funzione per popolare la select delle classi
function populateClassSelect(data) {
    let elento_classi = new Set(data.map(row => row.Classe));
    $("#classe-select").html(`
        <option value="null" selected></option>
        <option value="All">Tutti</option>
    `);
    Array.from(elento_classi).sort().forEach(classe => {
        $("#classe-select").append(`<option value="${classe}">${classe}`);
    });
}

// Funzione per gestire gli errori
function handleError(err) {
    console.error("Errore: ", err.status, err.statusText);
    if (err.status === 401) {
        alert("Unauthorized: Please log in");
        window.location.href = "/login";
    }
}

// Funzione per inizializzare gli eventi dell'interfaccia utente
function initializeUIEvents() {
    $("#classe-select").on("change", filterTable);
    $("#refresh-btn").click(fetchData);
    $("tbody").on('click', handleTableClick);
    $('#close-popup').click(() => {
        $('#overlay, #edit-popup').hide();
    });
    $('#edit-form').on('submit', handleFormSubmit);
    $("#hide-offline").click(handleHideOfflineToggle); // Aggiungi l'evento per la checkbox
}

// Funzione per filtrare la tabella
function filterTable() {
    const selectedClass = $("#classe-select option:selected").val();
    const isFleg = $("#hide-offline").is(":checked");
    $(`tbody>tr`).each((_, row) => {
        const isOnline = $(row).find('.status-icon').hasClass("online");
        const isVisible = (selectedClass === "All" || $(row).hasClass(selectedClass)) && selectedClass !== "null" && (!isFleg || isOnline);
        $(row).toggle(isVisible);
    });
}

// Funzione per gestire i click sulla tabella
async function handleTableClick(event) {
    const target = $(event.target);
    const id = target.data('id');

    if (target.hasClass('edit-btn')) {
        await handleEditClick(id);
    } else if (target.hasClass('delete-btn')) {
        await handleDeleteClick(id);
    } else if (target.hasClass('hidden-psw-btn')) {
        await handlePasswordToggle(id, target);
    }
}

// Funzione per gestire il click sul pulsante "Modifica"
async function handleEditClick(id) {
    try {
        const cells = $(`tr[data-id="${id}"] > td`);
        const userInfo = cells.map((index, cell) => {
            if (index > 0 && index < 6) {
                return $(cell).text();
            }
        }).get();

        const psw = await $.get(`/api/password/${id}`);
        userInfo.push(psw);
        openEditPopup(userInfo);
    } catch (err) {
        handleError(err);
    }
}

// Funzione per gestire il click sul pulsante "Elimina"
async function handleDeleteClick(id) {
    const conferma = confirm("Sei sicuro di voler eliminare questo record?");
    if (!conferma) return;

    try {
        const data = await $.ajax({ url: `/api/delete/${id}`, type: 'DELETE' });
        alert(data.messaggio);
        fetchData();
    } catch (err) {
        handleError(err);
    }
}

// Funzione per gestire il toggle della password
async function handlePasswordToggle(id, target) {
    const passwordSpan = $(`.password-hidden[data-id="${id}"]`);

    if (passwordSpan.data('visible') === true) {
        passwordSpan.text('**********');
        passwordSpan.data('visible', false);
        target.text('🙈');
        return;
    }

    try {
        const data = await $.getJSON(`/api/password/${id}`);
        passwordSpan.text(data);
        passwordSpan.data('visible', true);
        target.text('🐵');
    } catch (err) {
        handleError(err);
    }
}

// Funzione per aprire il popup di modifica
function openEditPopup(row) {
    $("#overlay , #edit-popup").show();
    $('#edit-id').val(row[0]);
    $('#edit-cognome').val(row[1]);
    $('#edit-nome').val(row[2]);
    $('#edit-classe').val(row[3]);
    $('#edit-username').val(row[4]);
    $('#edit-password').val(row[5]);
}

// Funzione per gestire il submit del form di modifica
async function handleFormSubmit(event) {
    event.preventDefault();

    const ID = $('#edit-id').val();
    const Cognome = $('#edit-cognome').val();
    const Nome = $('#edit-nome').val();
    const Classe = $('#edit-classe').val();
    const Username = $('#edit-username').val();
    const Password = $('#edit-password').val();

    try {
        const data = await $.ajax({
            url: '/api/update',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ ID, Cognome, Nome, Classe, Username, Password })
        });
        alert(data.messaggio);
        $('#overlay, #edit-popup').hide();
        updateRow(data.updateUser);
    } catch (err) {
        console.error('Errore durante l\'aggiornamento:', err);
        alert("Si è verificato un errore durante l'aggiornamento. Riprova più tardi.");
    }
}

// Funzione per aggiornare i valori nella riga modificata
function updateRow(user) {
    const row = $(`tr[data-id="${user.ID}"]`);
    const cells = row.children().slice(2, 5); // Ottieni solo le celle da 2 a 4 (escludendo l'ID e lo Status)
    cells.eq(0).text(user.Cognome);
    cells.eq(1).text(user.Nome);
    cells.eq(2).text(user.Classe);
    cells.eq(3).text(user.Username);
}

// Funzione per gestire il toggle della checkbox "Nascondi offline"
function handleHideOfflineToggle() {
    const selectedClass = $("#classe-select option:selected").val() === "All" ? "" : "." + $("#classe-select option:selected").val();
    if ($("#hide-offline").is(":checked")) {
        $(`tbody>tr${selectedClass}`).each((i, row) => {
            const isOnline = $(row).find('.status-icon').hasClass("online");
            $(row).toggle(isOnline);
        });
    } else {
        $(`tbody>tr${selectedClass}`).show();
    }
}
