import React from 'react';
import '../../styles/Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul>
                <li><a href="/view">File Manager</a></li>
                <li><a href="/upload">File Transfer</a></li>
                <li><a href="/verificastudente">Verifica in Corso</a></li>
                <li><a href="/docdashboard">DocDashboard</a></li>
                <li><a href="/studentdashboard">Studente Dashboard</a></li>
                <li><a href="/sessions">Sessions Debugger</a></li>
                <li><a href="/api/debug-session">Current Session Debugger</a></li>
            </ul>
        </nav>
    );
};

export default Navbar;