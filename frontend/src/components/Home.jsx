import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';

const Home = () => {
    useEffect(() => {
        document.title = "Home";
    }, []);

    return (
        <div className='centered-box'>
            <div className="container">
                <h1>Benvenuto!</h1>
                <Link to="/login">Login</Link>
                <Link to="/register">Registrati</Link>
            </div> 
        </div>
    );
};

export default Home;