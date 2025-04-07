import React, {useEffect } from 'react';
import { checkSession,saveUsername,saveUserClass } from '../utils/authUtils'; // Funzione per verificare lo stato della sessione
import '../styles/style.css'; // Importa il tuo file CSS per lo stile

const Login = () => {


    // Controlla lo stato della sessione all'inizio
    useEffect(() => {
        document.title = 'Login';
        const verifySession = async () => {
            const session = await checkSession();
            if (session.isAuthenticated) {
                // Reindirizza alla pagina appropriata in base alla classe dell'utente
                switch (session.classe) {
                    case 'admin':
                        window.location.href = '/dbdashboard';
                        break;
                    case 'doc':
                        window.location.href = '/docdashboard';
                        break;
                    default:
                        window.location.href = '/studentdashboard';   
                        break;
                }
            }
        };

        verifySession();
    });
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = {
            username: form.username.value,
            password: form.password.value,
            classe: form.classe.value
        };
        // Invia i dati al server
            const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (response.ok) {
            // Salva l'username nei cookie
            saveUsername(formData.username);
            saveUserClass(formData.classe);
            alert(result.message);
            window.location.href = result.redirectTo; // Reindirizza alla pagina specificata dal server
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="centered-box">
            <form id="loginForm" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    required
                /><br />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                /><br />
                <input
                    type="text"
                    name="classe"
                    placeholder="Classe (es. Classe1A)"
                    style={{textTransform: 'uppercase'}}
                    required
                /><br />
                <button type="submit">Accedi</button>
            </form>
            <div id="registerLink">
                <p>Non hai un account? <a href="/register">Registrati</a></p>
            </div>
        </div>
    );
};

export default Login;