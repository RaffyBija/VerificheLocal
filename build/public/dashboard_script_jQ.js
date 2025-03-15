//Funzione per visualizzare la tabella
function fetchData() {
    $('#loading-overlay').show(); // Mostra overlay prima della richiesta
    $.get('/api/data')
        .done((data) => {
                let classi = new Set();
                $("tbody").empty();//Pulisco/Svuoto la tabella
                data.forEach(row => {
                    console.log(row.ID," isOnline?",row.isOnline);
                    classi.add(row.Classe);

                    $('tbody').append(`<tr class="${row.Classe}" data-id="${row.ID}">`);
                    $(`[data-id="${row.ID}`).append(`
                     <td><span class="status-icon" data-id="${row.ID}"></span></td>
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

                 `).hide(); //Li nascondo come valore di default

                    //Feature per visualizzare se un utente è online 
                    //Da debuggare
                    if (row.isOnline) $(`.status-icon[data-id="${row.ID}"]`).toggleClass('online');
                });

                //Gestione lista per il filter
                //Ripulisto la lista e inserisco i valori di default
                $("#classe-select").html(`
                        <option value="null" selected></option>
                        <option value="All" >Tutti</option>`);
                //Inserisco le varie option nella select per filtrare la tabella
                let setOrdinato = Array.from(classi).sort(); // Ordino il SET generato in modo crescente usando il sort e convertendolo in Array
                setOrdinato.forEach(classe => {
                    $("#classe-select").append(`<option value="${classe}">${classe}`);
                });
        })
        .fail(err => {
            console.error("Errore: ", err.status, err.statusText);
            if (err.status === 401) {
                alert("Unauthorized: Please log in");
                window.location.href = "/login";
            }
        })
        .always(() => {
            $('#loading-overlay').fadeOut(); // Nasconde overlay dopo la richiesta
        });
}
//Aggiungo l'evento per applicare il filtro alla tabella
/*
//Mia implementazione
$("#classe-select").on("change",()=>{
   $(`tr[class]`).each((index,element)=>{
       //$("#classe-select option:selected").val() ottengo il valore della option selezionata
       if(($(element).is("."+$("#classe-select option:selected").val()) || ($("#classe-select option:selected").val())==="All") && !(($("#classe-select option:selected").val())==="null"))
       $(element).show();
       else $(element).hide();
   });
});*/

//Implementazione ottimizzata (by ChatGPT)
$("#classe-select").on("change", () => {
    const selectedClass = $("#classe-select option:selected").val();
    const isFleg = $("#hide-offline").is(":checked");
    $(`tbody>tr`).each((index, row) => {
        const isOnline = $($((row.firstElementChild).firstElementChild)).hasClass("online");
        if(isFleg){
            const isVisible = ((selectedClass === "All" || $(row).hasClass(selectedClass)) && selectedClass !== "null") && (isOnline);
            $(row).toggle(isVisible);
        }
        else{
            const isVisible = (selectedClass === "All" || $(row).hasClass(selectedClass)) && selectedClass !== "null";
            $(row).toggle(isVisible);
        }
    });
});
// Carica i dati all'avvio
fetchData();

 //Aggiungo l'evento a un pulsante per richiedere i dati dal server
 $("#refresh-btn").click(() => {
    fetchData();
});
// Funzione per aprire il popup
function openEditPopup(row) {
    $("#overlay , #edit-popup").show();
    console.log(row);
    // Precompila i campi con i dati esistenti
    $('#edit-id').val(row[0]);
    $('#edit-cognome').val(row[1]);
    $('#edit-nome').val(row[2]);
    $('#edit-classe').val(row[3]);
    $('#edit-username').val(row[4]);
    $('#edit-password').val(row[5]);
}
$("tbody").on('click', (event) => {
    const target = $(event.target);

    // Recupera l'ID una sola volta
    const id = target.data('id');

    // Aggiungi eventi ai pulsanti "Modifica"
    if (target.hasClass('edit-btn')) {
        const cells = $(`tr[data-id="${id}"] > td`);

        // Salva i dati esistenti in un array, saltando la colonna ID (index < 1) e la colonna extra (index > 5)
        const userInfo = cells.map((index, cell) => {
            if (index > 0 && index < 6) { // Salta l'ID e la colonna "extra"
                return $(cell).text();
            }
        }).get();  // Converte in array

        // Recupera la password solo se necessario
        $.get(`/api/password/${id}`).done((psw) => {
            userInfo.push(psw); // Aggiungi la password alla fine dell'array

            // Chiama la funzione per aprire il popup di modifica
            openEditPopup(userInfo);
        }).fail((err) => {
            console.error("Errore durante il recupero della password:", err);
            console.error("Errore: ", err.status, err.statusText);
            if (err.status === 401) {
                alert("Unauthorized: Please log in");
                window.location.href = "/login";
            }
        });
    }

    // Event listener per il pulsante "Elimina"
    if (target.hasClass('delete-btn')) {
        // Mostra un avviso di conferma
        const conferma = confirm("Sei sicuro di voler eliminare questo record?");
        if (!conferma) {
            return; // L'utente ha annullato l'azione
        }

        // Se confermato, invia la richiesta al server
        $.ajax({
            url: `/api/delete/${id}`,
            type: 'DELETE',
            success: (data) => {
                alert(data.messaggio);
                fetchData();
            },
            error: (err) => {
                console.error("Errore durante l'eliminazione", err);
                console.error("Errore: ", err.status, err.statusText);
                if (err.status === 401) {
                    alert("Unauthorized: Please log in");
                    window.location.href = "/login";
                }
            }
        });
    }

    // Evento per visualizzare o nascondere la password
    if (target.hasClass('hidden-psw-btn')) {
        const passwordSpan = $(`.password-hidden[data-id="${id}"]`);

        // Effetto toggle
        if (passwordSpan.data('visible') === true) {
            passwordSpan.text('**********');
            passwordSpan.data('visible', false);
            target.text('🙈');
            return;
        }

        // Recupero la password dal server
        $.getJSON(`/api/password/${id}`)
            .done((data) => {
                passwordSpan.text(data);
                passwordSpan.data('visible', true);
                target.text('🐵');
            })
            .fail((err) => {
                console.error("Errore: ", err);
                console.error("Errore: ", err.status, err.statusText);
                if (err.status === 401) {
                    alert("Unauthorized: Please log in");
                    window.location.href = "/login";
                }
            });
    }
});

// Aggiungi evento per il pulsante "Annulla"
$('#close-popup').click(() => {
    $('#overlay, #edit-popup').hide()
});

// Gestisci il salvataggio dei dati modificati
$('#edit-form').on('submit', function (event) {
    event.preventDefault();

    // Recupera i dati dai campi del form
    const ID = $('#edit-id').val();
    const Cognome = $('#edit-cognome').val();
    const Nome = $('#edit-nome').val();
    const Classe = $('#edit-classe').val();
    const Username = $('#edit-username').val();
    const Password = $('#edit-password').val();

    // Effettua la richiesta di aggiornamento dei dati
    $.ajax({
        url: '/api/update',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ ID, Cognome, Nome, Classe, Username, Password }),
        success: function (data) {
            alert(data.messaggio);
            $('#overlay, #edit-popup').hide()
            updateRow(data.updateUser);
        },
        error: (err) => {
            console.error('Errore durante l\'aggiornamento:', err);
            alert("Si è verificato un errore durante l'aggiornamento. Riprova più tardi.");
        }
    });
});

// Funzione per aggiornare i valori nella riga modificata
function updateRow(user) {
    // Recupera la riga che corrisponde all'ID del Record
    const row = $(`tr[data-id="${user.ID}"]`);
    const cells = row.children().slice(2, 5); // Ottieni solo le celle da 2 a 4 (escludendo l'ID e lo Status)
    // Aggiorna i valori nelle celle
    cells.eq(0).text(user.Cognome);
    cells.eq(1).text(user.Nome);
    cells.eq(2).text(user.Classe);
    cells.eq(3).text(user.Username);
}
