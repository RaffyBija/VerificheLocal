import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul>
                <li><NavLink to="/view">File Manager</NavLink></li>
                <li><NavLink to="/upload">File Transfer</NavLink></li>
                <li><NavLink to="/verificastudente">Verifica in Corso</NavLink></li>
                <li><NavLink to="/docdashboard">DocDashboard</NavLink></li>
                <li><NavLink to="/studentdashboard">Studente Dashboard</NavLink></li>
                <li><NavLink to="/sessions">Sessions Debugger</NavLink></li>
                <li><NavLink to="/api/debug-session">Current Session Debugger</NavLink></li>
            </ul>
        </nav>
    );
};

export default Navbar;