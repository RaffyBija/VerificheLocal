import React from 'react';
import '../../styles/RecordActions.css'; // Importa il tuo file CSS per lo stile

const RecordActions = ({ row, handleDelete, onEdit }) => {
    const handleEdit = () => {
        onEdit(row); // Passa i dati dell'utente al componente principale
    };

    const handleDeleteClick = async () => {
        const confirmDelete = window.confirm(
            `Sei sicuro di voler eliminare il record dell'utente "${row.Nome} ${row.Cognome}"?`
        );
        if (confirmDelete) {
            await handleDelete(row.ID); // Chiama la funzione di eliminazione
        }
    };

    return (
        <div className="record-actions">
            <button onClick={handleEdit}>✏️</button>
            <button onClick={handleDeleteClick}>🗑️</button>
        </div>
    );
};

export default RecordActions;