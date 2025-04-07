import React from 'react';
import '../styles/Footer.css'; // Optional: Import a CSS file for styling

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer>
            <p>© {currentYear} - Tutti i diritti riservati</p>
        </footer>
    );
};

export default Footer;