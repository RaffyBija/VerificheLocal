import React from 'react';
import '../styles/Header.css'; // Usa lo stile già definito
import { fetchUsername,fetchUserClass } from '../utils/authUtils'; // Importa la funzione
import { useEffect, useState } from 'react';

const Header = ({ title}) => {

    const [userClass, setUserClass] = useState('');
    const [userName, setUserName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userClass = await fetchUserClass();
                const userName = await fetchUsername();
                setUserClass(userClass);
                setUserName(userName);
            } catch (err) {
                setError(err.message || 'Errore sconosciuto');
            }
        };

        fetchUserData();
    });
    
    // Funzione per reindirizzare alla home page in base alla classe
    const redirectToHome = () => {
        switch (userClass) {
            case 'admin':
                return '/dbdashboard';
            case 'doc':
                return '/docdashboard';
            default:
                return '/studentdashboard';
        }
    }
    return (
        <header>
            {error && <p className="error">{error}</p>}
            {!error && (
                <>
                    <a id="home-button" href={redirectToHome()}>🏠</a>
                    <h1>{title}</h1>
                    <p id="username-display">{userName? userName : ''}</p>
                </>
            )}
        </header>
    );
};

export default Header;