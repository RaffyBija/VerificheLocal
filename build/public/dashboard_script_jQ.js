$(document).ready(() => {
    initializeUIEvents();
    fetchData();
});

// Funzione per ottenere la classe selezionata
function getSelectedClass() {
    const selectedValue = $("#classe-select option:selected").val();
    return selectedValue === "All" ? "" : `.${selectedValue}`;
}

// Funzione per caricare i dati
async function fetchData() {
    try {
        toggleLoadingOverlay(true);
        const data = await $.get('/api/data');
        renderTable(data);
        populateClassSelect(data);
    } catch (err) {
        handleError(err);
    } finally {
        toggleLoadingOverlay(false);
    }
}

// Funzione per mostrare/nascondere l'overlay di caricamento
function toggleLoadingOverlay(show) {
    $('#loading-overlay').toggle(show);
}

// Funzione per popolare la tabella
function renderTable(data) {
    const classSet = new Set();
    const tbody = $("tbody").empty();

    data.forEach(row => {
        classSet.add(row.Classe);
        const tr = createTableRow(row);
        tbody.append(tr);
    });
}

// Funzione per creare una riga della tabella
function createTableRow(row) {
    const statusClass = row.isOnline ? 'online' : 'offline';
    return $(`
        <tr class="${row.Classe}" data-id="${row.ID}">
            <td><span class="status-icon ${statusClass}" data-id="${row.ID}"></span></td>
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
        </tr>
    `).hide();
}

// Funzione per popolare il menu a tendina delle classi
function populateClassSelect(data) {
    const classSet = new Set(data.map(row => row.Classe));
    const select = $("#classe-select").html(`
        <option value="null" selected></option>
        <option value="All">Tutti</option>
    `);
    Array.from(classSet).sort().forEach(classe => {
        select.append(`<option value="${classe}">${classe}</option>`);
    });
}

// Funzione per gestire gli errori
function handleError(err) {
    console.error("Errore: ", err.status, err.statusText);
    const message = err.responseJSON?.message || "Si è verificato un errore. Riprova più tardi.";
    alert(`Errore: ${message}`);
    if (err.status === 401) {
        window.location.href = "/login";
    }
}

// Funzione per inizializzare gli eventi dell'interfaccia utente
function initializeUIEvents() {
    $("#classe-select").on("change", filterTable);
    $("#refresh-btn").click(fetchData);
    $("tbody").on('click', handleTableClick);
    $('#close-popup').click(() => $('#overlay, #edit-popup').hide());
    $('#edit-form').on('submit', handleFormSubmit);
    $("#hide-offline").click(filterTable);
    $('#search-bar').on('input', searchBar).val("");
    $('#add-user-btn').click(openAddUserForm);
}

// Funzione per filtrare la tabella
function filterTable() {
    const selectedClass = getSelectedClass();
    const hideOffline = $("#hide-offline").is(":checked");
    const searchValue = $('#search-bar').val().toLowerCase();

    $(`tbody>tr`).each((_, row) => {
        const $row = $(row);
        const isOnline = $row.find('.status-icon').hasClass("online");
        const matchesClass = selectedClass === "" || $row.hasClass(selectedClass.slice(1));
        const matchesSearch = $row.text().toLowerCase().includes(searchValue);
        const isVisible = matchesClass && matchesSearch && (!hideOffline || isOnline);
        $row.toggle(isVisible);
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

// Funzione per aprire la form in modalità "Aggiungi utente"
function openAddUserForm() {
    $("#form-title").text("Aggiungi Nuovo Utente");
    $("#edit-form")[0].reset(); // Resetta tutti i campi
    $("#overlay, #edit-popup").show();
}

// Funzione per gestire il submit della form
async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
        ID: $('#edit-id').val(),
        cognome: $('#edit-cognome').val(),
        nome: $('#edit-nome').val(),
        classe: $('#edit-classe').val(),
        username: $('#edit-username').val(),
        password: $('#edit-password').val()
    };

    try {
        const url = formData.ID ? '/api/update' : '/register';
        const data = await $.ajax({
            url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData)
        });
        alert(data.messaggio);
        fetchData();
        $('#overlay, #edit-popup').hide();
    } catch (err) {
        handleError(err);
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
    
    if ($("#hide-offline").is(":checked")) {
        $(`tbody>tr${getSelectedClass()}`).each((i, row) => {
            const isOnline = $(row).find('.status-icon').hasClass("online");
            $(row).toggle(isOnline);
        });
    } else {
        $(`tbody>tr${selectedClass}`).show();
    }
}

// Funzione per gestire la barra di ricerca
function searchBar(){
    const selectedClass = getSelectedClass();
    const searchValue = $('#search-bar').val().toLowerCase();
    $(`tbody>tr${selectedClass}`).each((i, row) => {
        const rowText = $(row).text().toLowerCase();
        $(row).toggle(rowText.includes(searchValue));
    });
}