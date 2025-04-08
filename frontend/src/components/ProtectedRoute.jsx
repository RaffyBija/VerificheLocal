import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, userType, requiredRole, children }) => {
    if (!isAuthenticated) {
        // Reindirizza alla pagina di login se non autenticato
        return <Navigate to="/error/401" replace />;
    }

    if (requiredRole && userType !== requiredRole) {
        // Reindirizza alla pagina di errore 403 se il ruolo non corrisponde
        return <Navigate to="/error/403" replace />;
    }

    // Mostra il contenuto della route se autenticato e autorizzato
    return children;
};

export default ProtectedRoute;