//Recupero il nome utente
$(document).ready(() => {
    //Recupero il nome utente dal server e lo scrivo nell DOM 
    $.get('/api/user', (data, status) => {
        $("#username").text(data.username);
    });
    //Aggiungo l'evento ad un pulsante per aprire e chiudere la navbar
    $("#toggle-btn").click(() => {
        $("#navbar").toggleClass("closed");
        $("ul").toggle("fast");
    });
  
    //Fix checkbox, anche dopo il refresh della pagina rimaneva impostato all'ultimo valore
    $("#hide-offline").prop('checked', false);
    //Evento per nascondere utenti offline
    $("#hide-offline").click((element)=>{
        const selectedClass = $("#classe-select option:selected").val() ==="All" ? "":"."+$("#classe-select option:selected").val();
        if($(element.target).is(":checked")){
            $(`tbody>tr${selectedClass}`).each((i,row)=>{
                const isOnline = $($((row.firstElementChild).firstElementChild)).hasClass("online");
                $(row).toggle(isOnline);
            });
        }
        else{
            $(`tbody>tr${selectedClass}`).show();
        }
    });
});