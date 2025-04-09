import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // Importa useLocation
import LogoutButton from './LogoutButton';
import {AiOutlineHome} from 'react-icons/ai'; // Importa l'icona di home
import { FaRegUserCircle } from "react-icons/fa";
import '../styles/Header.css'; // Usa lo stile già definito

const Header = ({ title, backgroundClass }) => {
    const [userClass, setUserClass] = useState('');
    const [userName, setUserName] = useState('');
    const location = useLocation(); // Ottieni il percorso corrente

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserClass(user.Classe);
            setUserName(`${user.Nome} ${user.Cognome}`);
        } 
        else {
            setUserClass('');
            setUserName('');
        }
    }, []);

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
    };

    // Determina se il pulsante "Home" deve essere nascosto
    const isHomePage = location.pathname === '/studentdashboard' || location.pathname === '/docdashboard' || location.pathname === '/dbdashboard';

    return (
        <header className={`header ${backgroundClass}`}>
            <div className="header-left">
                {!isHomePage && (
                    <a id="home-button" href={redirectToHome()}>
                        <AiOutlineHome size={30} /> {/* Icona di home */}
                    </a>
                )}
            </div>
            <div className="header-center">
                <h1>{title}</h1>
            </div>
            <div className="header-right">
                <div id="username-display">
                    <FaRegUserCircle size={20} /> {/* Icona dell'utente */}
                    {userName}
                    <LogoutButton />
                </div>
            </div>
        </header>
    );
};

export default Header;