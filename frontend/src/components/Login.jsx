import React, { useEffect } from 'react';
import '../styles/style.css'; // Importa il tuo file CSS per lo stile
import { checkSession } from '../utils/authUtils'; // Importa la funzione di controllo autenticazione

const Login = () => {
    useEffect(() => {
        const verifySession = async () => {
            const session = await checkSession();
            if (session.isAuthenticated) {
                const user = JSON.parse(localStorage.getItem('user'));
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
        };

        verifySession();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = {
            username: form.username.value,
            password: form.password.value,
            classe: form.classe.value
        };

        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(result.user));
            window.location.href = result.redirectTo;
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