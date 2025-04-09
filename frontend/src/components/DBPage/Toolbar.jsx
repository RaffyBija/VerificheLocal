import React, { useState } from 'react';
import '../../styles/Toolbar.css';
import UserModal from './UserModal';

const Toolbar = ({ setData,setOriginalData, classes, originalData, setMessage, setMessageType }) => {
    const [selectedClass, setSelectedClass] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [hideOffline, setHideOffline] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Gestisce il filtro per classe
    const handleClassChange = (event) => {
        setSelectedClass(event.target.value);
        filterData(event.target.value, searchValue, hideOffline);
    };

    // Gestisce la ricerca
    const handleSearch = (event) => {
        setSearchValue(event.target.value);
        filterData(selectedClass, event.target.value, hideOffline);
    };

    // Gestisce il filtro per utenti offline
    const handleHideOffline = (event) => {
        setHideOffline(event.target.checked);
        filterData(selectedClass, searchValue, event.target.checked);
    };

    // Filtra i dati in base ai criteri
    const filterData = (classe, search, hideOffline) => {
        let filteredData = [...originalData]; // Usa una copia dei dati originali

        // Filtra per classe
        if (classe && classe !== 'Tutti') {
            filteredData = filteredData.filter(row => row.Classe === classe);
        }

        // Filtra per ricerca
        if (search) {
            filteredData = filteredData.filter(row =>
                row.Nome.toLowerCase().includes(search.toLowerCase()) ||
                row.Cognome.toLowerCase().includes(search.toLowerCase()) ||
                row.Username.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Filtra per utenti offline
        if (hideOffline) {
            filteredData = filteredData.filter(row => row.isOnline);
        }

        setData(filteredData); // Aggiorna i dati filtrati
    };

    const handleAddUserClick = () => {
        setIsModalOpen(true); // Mostra il popup
    };

    const handleSave = (newUser) => {
        try {
            setData((prevData) => [...prevData, newUser]); // Aggiungi il nuovo utente ai dati esistenti
            setOriginalData((prevData) => [...prevData, newUser]); // Aggiungi il nuovo utente ai dati originali
            setMessage('Utente aggiunto con successo!');
            setMessageType('success');
        } catch (error) {
            console.error('Errore durante l\'aggiunta del nuovo utente:', error);
            setMessage('Errore durante l\'aggiunta del nuovo utente.');
            setMessageType('error');
        }
    };

    return (
        <div className="toolbar">
            <label htmlFor="classe-select">Filtra per classe:</label>
            <select id="classe-select" value={selectedClass} onChange={handleClassChange}>
                {classes.map((classe, index) => (
                    <option key={index} value={classe}>
                        {classe}
                    </option>
                ))}
            </select>

            <label>
                <input
                    type="checkbox"
                    checked={hideOffline}
                    onChange={handleHideOffline}
                />
                Nascondi utenti offline
            </label>

            <input
                type="text"
                placeholder="Cerca..."
                value={searchValue}
                onChange={handleSearch}
            />

            <button onClick={handleAddUserClick}>Aggiungi Utente</button>

            {isModalOpen && (
                <UserModal
                    user={null} // Passa null per indicare che stiamo aggiungendo un nuovo utente
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default Toolbar;