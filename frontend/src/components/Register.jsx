import React, { useState, useEffect } from 'react';
import '../styles/style.css'; // Importa il tuo file CSS per lo stile

const Register = () => {
    const [formData, setFormData] = useState({
        Nome: '',
        Cognome: '',
        Username: '',
        Password: '',
        Classe: ''
    });

    useEffect(() => {
        document.title = 'Registrazione';
    }, []);

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
            <div className="container">
                <form onSubmit={handleSubmit}>
                    <h2>Registrazione</h2>
                    <input type="text" name="Cognome" placeholder="Cognome" value={formData.Cognome} onChange={handleChange} required /><br />
                    <input type="text" name="Nome" placeholder="Nome" value={formData.Nome} onChange={handleChange} required /><br />
                    <input type="text" name="Username" placeholder="Username" value={formData.Username} onChange={handleChange} required /><br />
                    <input type="password" name="Password" placeholder="Password" value={formData.Password} onChange={handleChange} required /><br />
                    <input type="text" name="Classe" placeholder="Classe (es. Classe1A)" value={formData.Classe} onChange={handleChange} maxLength="10" required /><br />
                    <button type="submit">Registrati</button>
                </form>
            </div>
        </div>
    );
};

export default Register;