//Recupero il nome utente
document.addEventListener('DOMContentLoaded', async()=>{
    try{
         const response = await fetch('/api/user',{
             method:'GET',
             credentials:"include",
             headers:{
                 'Content-Type':'application/json'
             }
         });
         const result = await response.json();
         document.getElementById('username').innerText=" "+result.username;
     } catch (error){
         console.error('Errore: ',error);
     }           
 });

 function filterValue(selectBody){
     //Trovo il valore selezionato nel select
     const selectedOption = selectBody.options[selectBody.selectedIndex];
     const value = selectedOption.value;
        
     const rows = document.querySelectorAll("tr[class]");

     rows.forEach( row =>{
         if((!(value === row.className)||value==="null")&&!(value==="All")){
             row.style.visibility = "hidden";
             row.style.display = "none";
         }
         else{
             row.style.visibility = "visible";
             row.style.display = "";
         }
     });
 }

 //Funzione per visualizzare la tabella
 function fetchData(){
     const selectBody = document.getElementById("classe-select");
     let classi = new Set(); //Set per ottenere la singola classe presente
     fetch('/api/data')
         .then(response => response.json())
         .then(data => {
             const tableBody = document.getElementById('data-table').querySelector('tbody');
             tableBody.innerHTML = ''; // Pulisce la tabella
             data.forEach(row => {
                 classi.add(row.Classe);//Aggiungo il valore ottenuto dal server nel Set
                 
                 const tr = document.createElement('tr');
                 tr.className = row.Classe;
                 tr.setAttribute('data-id',row.ID);
                 tr.innerHTML = `
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

                 `;
                 //Non visibili di default
                 tr.style.visibility ="hidden";
                 tr.style.display = "none";
                 tableBody.appendChild(tr);
                 const onlineIcon = document.querySelector(`span[data-id="${row.ID}"]`);
                 if(row.isOnline) {
                     onlineIcon.classList.add("online");
                 }
                 else{
                     onlineIcon.classList.remove("online");
                     onlineIcon.classList.add("offline");
                 }
             });
             //Pulisco le scelte del select
             selectBody.innerHTML=`
                 <option value="null" selected></option>
                 <option value="All" >Tutti</option>`;

                 let setOrdinato = Array.from(classi).sort(); // Ordino il SET generato in modo crescente usando il sort e convertendolo in Array
             setOrdinato.forEach(classe =>{
                 selectBody.innerHTML += `<option value="${classe}">${classe}</option>`;
             });
             //Aggiungo un evento per filtrare la tabella
             selectBody.onchange = ()=> filterValue(selectBody);
         })
         .catch(err => console.error("Errore: ",err));
         
 }
 
  
 // Carica i dati all'avvio
 fetchData();
 // Funzione per aprire il popup
 function openEditPopup(row) {
     document.getElementById('overlay').style.display = 'block';
     document.getElementById('edit-popup').style.display = 'block';

     // Precompila i campi con i dati esistenti
     document.getElementById('edit-id').value = row.ID;
     document.getElementById('edit-cognome').value = row.Cognome;
     document.getElementById('edit-nome').value = row.Nome;
     document.getElementById('edit-classe').value = row.Classe;
     document.getElementById('edit-username').value = row.Username;
     document.getElementById('edit-password').value = row.Password;
 }

 // Funzione per chiudere il popup
 function closeEditPopup() {
     document.getElementById('overlay').style.display = 'none';
     document.getElementById('edit-popup').style.display = 'none';
 }

 
 document.addEventListener('click', (event) => {
     
     // Aggiungi eventi ai pulsanti "Modifica"
     if (event.target.classList.contains('edit-btn')) {
         const id = event.target.getAttribute('data-id');
         const cells = document.querySelectorAll(`tr[data-id="${id}"]>td`);
         fetch(`/api/data/${id}`) // Ottieni i dati specifici dal server
             .then(response => response.json())
             .then(row => openEditPopup(row))
             .catch(err => console.error('Errore nel recupero dati:', err));
     }
     
     //Event listener per il pulsante "Elimina"
     if(event.target.classList.contains('delete-btn')){
         const id = event.target.getAttribute('data-id');

         //Mostra un avviso di conferma
         const conferma = confirm("Sei sicuro di voler eliminare questo record?");
         if(!conferma){
             return; //L'utente ha annullato l'azione
         }

         //Se confermato, invia la richiesta al server
         fetch(`/api/delete/${id}`,{
             method: 'DELETE'
         })
         .then(response =>{
             if(!response.ok){
                 throw new Error('Errore durante l\'eliminazione');
             }
             return response.json();
         })
         .then(data => {
             alert(data.messaggio);
             fetchData();
         })
         .catch(err => console.error("Errore durante l\'eliminazione",err));
     }

     //Evento per visualizzare o nascondere la password
     if(event.target.classList.contains('hidden-psw-btn')){
         const id = event.target.getAttribute('data-id');
         const passwordSpan = document.querySelector(`.password-hidden[data-id="${id}"]`);

         //Effetto toogle
         if(passwordSpan.getAttribute('data-visible')==='true'){
             passwordSpan.textContent = '**********';
             passwordSpan.setAttribute('data-visible','false');
             event.target.innerText = "🙈";
             return;
         }

         //Recupero la password dal server
         fetch(`/api/password/${id}`)
         .then(response =>{
             if(!response.ok){
                 throw new Error("Errore durante il recupero della password");
             }
             return response.json();
         })
         .then(data =>{
             passwordSpan.textContent = data//mostro la password
             passwordSpan.setAttribute('data-visible','true');
             event.target.innerText = "🐵";

         })
         .catch(err =>console.error("Errore: ",err));
     }
 });

 // Aggiungi evento per il pulsante "Annulla"
 document.getElementById('close-popup').addEventListener('click', closeEditPopup);

 // Gestisci il salvataggio dei dati modificati
 document.getElementById('edit-form').addEventListener('submit', (event) => {
     event.preventDefault();

     const ID = document.getElementById('edit-id').value;
     const Cognome = document.getElementById('edit-cognome').value;
     const Nome = document.getElementById('edit-nome').value;
     const Classe = document.getElementById('edit-classe').value;
     const Username = document.getElementById('edit-username').value;
     const Password = document.getElementById('edit-password').value;

     fetch('/api/update', {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json'
         },
         body: JSON.stringify({ ID, Cognome, Nome, Classe, Username, Password })
     })
         .then(response => {
             if (!response.ok) {
                 throw new Error('Errore durante l\'aggiornamento');
             }
             return response.json();
         })
         .then(data => {
             alert(data.messaggio);
             closeEditPopup();
             updateRow(data.updateUser);
         })
         .catch(err => console.error('Errore durante l\'aggiornamento:', err));
 });

 //Funzione per aggiornare i valori nella riga modificata
 const updateRow = (user)=>{
     //Recupero la riga che corrisponde all'ID del Record
     const row = document.querySelector(`tr[data-id="${user.ID}"]`);
     let cells = [...row.children];// Converto una HTMLCollection in array
     cells = cells.slice(1,5);
     cells[0].innerText=user.ID;
     cells[1].innerText=user.Cognome;
     cells[2].innerText=user.Nome;
     cells[3].innerText=user.Classe;
     cells[4].innerText=user.Username;        
 }