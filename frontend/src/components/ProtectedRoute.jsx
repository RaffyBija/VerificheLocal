import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, children }) => {
    if (!isAuthenticated) {
        // Reindirizza alla pagina di login se non autenticato
        return <Navigate to="/login" replace />;
    }

    // Mostra il contenuto della route se autenticato
    return children;
};

export default ProtectedRoute;