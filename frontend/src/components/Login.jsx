import React, { useEffect } from 'react';
import '../styles/style.css'; // Importa il tuo file CSS per lo stile

const Login = () => {
    // Controlla lo stato della sessione all'inizio
    useEffect(() => {
        document.title = 'Login';

        // Verifica lo stato della sessione dal localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.isAuthenticated) {
            // Reindirizza alla pagina appropriata in base al tipo di utente
            switch (user.Classe) {
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
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = {
            username: form.username.value,
            password: form.password.value,
            classe: form.classe.value,
        };

        // Invia i dati al server
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        const result = await response.json();

        if (response.ok) {
            // Salva i dati dell'utente nella sessione (localStorage)
            localStorage.setItem(
                'user',
                JSON.stringify({
                    isAuthenticated: true,
                    Classe: result.user.Classe,
                    Nome: result.user.Nome,
                    Cognome: result.user.Cognome,
                })
            );
            console.log(result);
            alert(result.message);
            window.location.href = result.redirectTo; // Reindirizza alla pagina specificata dal server
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="centered-box">
            <div className="container">
                <form id="loginForm" onSubmit={handleLogin}>
                    <h2>Login</h2>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        required
                    />
                    <br />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                    />
                    <br />
                    <input
                        type="text"
                        name="classe"
                        placeholder="Classe (es. Classe1A)"
                        style={{ textTransform: 'uppercase' }}
                        required
                    />
                    <br />
                    <button type="submit">Accedi</button>
                </form>
                <div id="registerLink">
                    <p>
                        Non hai un account? <a href="/register">Registrati</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;