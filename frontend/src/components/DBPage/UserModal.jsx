import React, { useState } from 'react';
import '../../styles/UserModal.css';

const EditUserModal = ({ user, onClose, onSave }) => {
    const isNewUser = !user; // Determina se stiamo aggiungendo un nuovo utente
    const [formData, setFormData] = useState({
        ID: user?.ID || '',
        Cognome: user?.Cognome || '',
        Nome: user?.Nome || '',
        Classe: user?.Classe || '',
        Username: user?.Username || '',
        Password: isNewUser ? '12345' : user?.Password, // Password predefinita solo per nuovi utenti
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const endpoint = isNewUser ? '/register' : '/api/update';
            const method = isNewUser ? 'POST' : 'PUT';

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }

            const updatedUser = await response.json();

            onSave(updatedUser.user); // Aggiorna i dati lato client
            onClose(); // Chiudi il popup
        } catch (error) {
            console.error('Errore durante il salvataggio dei dati:', error);
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{isNewUser ? 'Aggiungi Nuovo Utente' : 'Modifica Utente'}</h3>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <label>
                        Cognome:
                        <input
                            type="text"
                            name="Cognome"
                            value={formData.Cognome}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Nome:
                        <input
                            type="text"
                            name="Nome"
                            value={formData.Nome}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Classe:
                        <input
                            type="text"
                            name="Classe"
                            value={formData.Classe}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Username:
                        <input
                            type="text"
                            name="Username"
                            value={formData.Username}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    {isNewUser && (
                        <label>
                            Password (predefinita):
                            <input
                                type="password"
                                name="Password"
                                value={formData.Password}
                                readOnly
                            />
                        </label>
                    )}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={saving}>
                            Annulla
                        </button>
                        <button type="submit" disabled={saving}>
                            {saving ? 'Salvando...' : 'Salva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;