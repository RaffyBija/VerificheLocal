import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi'; // Importa l'icona di logout
import '../styles/LogoutButton.css'; // Stile personalizzato per il pulsante di logout

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', { method: 'GET', credentials: 'include' });
            const data = await response.json();
            if (response.ok) {
                alert(data.message)
                // Rimuovi i dati dell'utente da localStorage
                localStorage.removeItem('user');
                // Reindirizza alla pagina di login
                navigate('/login');
            } else {
                console.error('Errore durante il logout');
                alert(data.error||'Errore durante il logout. Riprova più tardi.');
            }
        } catch (error) {
            console.error('Errore durante il logout:', error);
            alert('Errore durante il logout. Riprova più tardi.');
        }
    };

    return (
        <button className="logout-button" onClick={handleLogout}>
            <FiLogOut size={20} /> {/* Icona di logout */}
        </button>
    );
};

export default LogoutButton;