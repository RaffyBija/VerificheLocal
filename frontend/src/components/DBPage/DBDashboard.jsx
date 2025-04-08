import React, { useState, useEffect } from 'react';
import Header from '../Header';
import Navbar from './Navbar';
import Toolbar from './Toolbar';
import DataTable from './DataTable';
import EditUserModal from './UserModal';
import '../../styles/DBDashboard.css';

const DBDashboard = () => {
    const [data, setData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [fadeOut, setFadeOut] = useState(false); // Stato per gestire la dissolvenza

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/data', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}) // Puoi aggiungere il payload necessario qui
                });
                const result = await response.json();

                setData(result);
                setOriginalData(result);

                const classSet = new Set(result.map(row => row.Classe));
                setClasses(['Tutti', ...Array.from(classSet).sort()]);
            } catch (error) {
                console.error('Errore durante il caricamento dei dati:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleSave = async (updatedUser) => {
        try {
            setData((prevData) =>
                prevData.map((item) =>
                    item.ID === updatedUser.ID ? updatedUser : item
                )
            );
            setOriginalData((prevData) =>
                prevData.map((item) =>
                    item.ID === updatedUser.ID ? updatedUser : item
                )
            );

            setMessage('Utente aggiornato con successo!');
            setMessageType('success');
            setIsModalOpen(false);
            triggerMessageTimeout(); // Avvia il timeout per il messaggio
        } catch (error) {
            console.error('Errore durante l\'aggiornamento dei dati:', error);
            setMessage('Errore durante l\'aggiornamento dei dati.');
            setMessageType('error');
            triggerMessageTimeout(); // Avvia il timeout per il messaggio
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/delete/${id}`, { method: 'DELETE' });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }

            setData((prevData) => prevData.filter((item) => item.ID !== id));
            setOriginalData((prevData) => prevData.filter((item) => item.ID !== id));

            setMessage('Record eliminato con successo!');
            setMessageType('success');
            triggerMessageTimeout(); // Avvia il timeout per il messaggio
        } catch (error) {
            console.error('Errore durante l\'eliminazione del record:', error);
            setMessage(error.message || 'Si è verificato un errore durante l\'eliminazione del record.');
            setMessageType('error');
            triggerMessageTimeout(); // Avvia il timeout per il messaggio
        }
    };

    const triggerMessageTimeout = () => {
        setFadeOut(false); // Resetta la dissolvenza
        setTimeout(() => setFadeOut(true), 2000); // Avvia la dissolvenza dopo 3 secondi
        setTimeout(() => setMessage(''), 2600); // Rimuove il messaggio dopo 4 secondi
    };

    return (
        <div className="dbdashboard">
            <Header title="Gestione Database" backgroundClass="dashboard-header" />
            <div className="dbdashboard-layout">
                <Navbar />
                <main className="dbdashboard-main">
                    {message && (
                        <div className={`message-banner ${messageType} ${fadeOut ? 'fade-out' : ''}`}>
                            {message}
                            <button onClick={() => setMessage('')}>✖</button>
                        </div>
                    )}
                    <Toolbar
                        setData={setData}
                        classes={classes}
                        originalData={originalData}
                    />
                    {loading ? (
                        <p>Caricamento...</p>
                    ) : (
                        <DataTable
                            data={data}
                            setData={setData}
                            onEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    )}
                </main>
            </div>
            {isModalOpen && (
                <EditUserModal
                    user={selectedUser}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default DBDashboard;