import React from 'react';

const TEST = () => {
    const styles = {
        body: {
            margin: 0,
            fontFamily: 'Arial, sans-serif',
        },
        sidebar: {
            height: '100vh',
            width: '250px',
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '20px',
        },
        sectionLabel: {
            marginTop: '20px',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: '#bdc3c7',
        },
        navLink: {
            display: 'block',
            padding: '10px',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
        },
        navLinkHover: {
            backgroundColor: '#34495e',
        },
    };

    return (
        <div style={styles.body}>
            <div style={styles.sidebar}>
                <div className="section">
                    <div style={styles.sectionLabel}>Sezione 1</div>
                    <a href="#dashboard" style={styles.navLink}>Dashboard</a>
                    <a href="#analisi" style={styles.navLink}>Analisi</a>
                </div>

                <div className="section">
                    <div style={styles.sectionLabel}>Sezione 2</div>
                    <a href="#utenti" style={styles.navLink}>Gestione Utenti</a>
                    <a href="#ruoli" style={styles.navLink}>Ruoli</a>
                </div>

                <div className="section">
                    <div style={styles.sectionLabel}>Impostazioni</div>
                    <a href="#profilo" style={styles.navLink}>Profilo</a>
                    <a href="#logout" style={styles.navLink}>Logout</a>
                </div>
            </div>
        </div>
    );
};

export default TEST;