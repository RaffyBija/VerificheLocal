// Recupero il nome utente
$(document).ready(() => {
    // Recupero il nome utente dal server e lo scrivo nel DOM 
    $.get('/api/user', (data, status) => {
        $("#username").text(data.username);
    });
    // Aggiungo l'evento ad un pulsante per aprire e chiudere la navbar
    $("#toggle-btn").click(() => {
        $("#navbar").toggleClass("closed");
        $("ul").toggle("fast");
    });

    //Logout
    $('#logout-button').click(() => {
        $.ajax({
            url: '/logout',
            type: 'GET',
            success: (data) => {
                alert(data.message);
                localStorage.removeItem('user');
                window.location.href = '/login';
            },
            error: (xhr, status, error) => {
                console.error("Errore durante il logout", error);
                alert("Errore durante il logout. Riprova più tardi.");
            }
        });
    });
});