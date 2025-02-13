const mysql = require ('mysql');

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'Nape71!!',
	database: 'Scuola'
});

db.connect((err)=>{
	if(err) console.log("Errore di connessione al database: ",err);
	
	const query = "SELECT classe FROM Alunni WHERE classe='doc'";
	db.query(query, (err,result)=>{
		if(err) console.log("Errore nell query: ",err);
		console.log(result);
		});
});
