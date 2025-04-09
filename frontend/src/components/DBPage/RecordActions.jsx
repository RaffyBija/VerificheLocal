import React from 'react';
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
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
            <button onClick={handleEdit}>
                <FaEdit />
            </button>
            <button onClick={handleDeleteClick}>
                <MdDeleteForever />
            </button>
        </div>
    );
};

export default RecordActions;