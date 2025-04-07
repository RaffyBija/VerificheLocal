import React, { useState, useEffect } from 'react';
import '../styles/style.css'; // Importa il tuo file CSS per lo stile

const Register = () => {
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        username: '',
        password: '',
        classe: ''
    });

    useEffect(() => {
        document.title = 'Registrazione';
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            window.location.href = result.redirectTo;
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="centered-box">
            <form onSubmit={handleSubmit}>
                <h2>Registrazione</h2>
                <input type="text" name="cognome" placeholder="Cognome" value={formData.cognome} onChange={handleChange} required /><br />
                <input type="text" name="nome" placeholder="Nome" value={formData.nome} onChange={handleChange} required /><br />
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required /><br />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required /><br />
                <input type="text" name="classe" placeholder="Classe (es. Classe1A)" value={formData.classe} onChange={handleChange} maxLength="10" required /><br />
                <button type="submit">Registrati</button>
            </form>
        </div>
    );
};

export default Register;