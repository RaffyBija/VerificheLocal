import React, { useEffect, useState } from 'react';
import Header from './Header'; // Importa il componente Header
import '../styles/StudentDashboard.css'; // Stile personalizzato per la dashboard

const StudentDashboard = () => {
    const [userInfo, setUserInfo] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = 'Dashboard Studente'; // Imposta il titolo della pagina
        loadUserInfo();
    }, []);

    const loadUserInfo = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserInfo(user);
            } catch (err) {
                setError('Errore nel caricamento delle informazioni utente');
            }
        } else {
            setError('Utente non autenticato');
        }
    };

    return (
        <>
            <Header title="Dashboard Studente" backgroundClass="dashboard-header" />
            <main className="student-dashboard">
                {error && <p className="error">{error}</p>}
                {!error && (
                    <>
                        <section className="user-info">
                            <h2>Le tue informazioni</h2>
                            <div className="user-details">
                                <p><strong>Nome:</strong> {userInfo.Nome}</p>
                                <p><strong>Cognome:</strong> {userInfo.Cognome}</p>
                                <p><strong>Classe:</strong> {userInfo.Classe}</p>
                            </div>
                        </section>
                        <section className="actions">
                            <button
                                className="action-button"
                                onClick={() => window.location.href = '/verificastudente'}
                            >
                                Accedi alla Verifica
                            </button>
                            <button
                                className="action-button"
                                onClick={() => window.location.href = '/review-explorer'}
                            >
                                Visualizza Correzioni
                            </button>
                        </section>
                    </>
                )}
            </main>
        </>
    );
};

export default StudentDashboard;