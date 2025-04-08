import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams, useSearchParams } from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ReviewExplorer from "./components/ReviewExplorer";
import StudentDashboard from "./components/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { checkSession } from "./utils/authUtils"; // Importa la funzione di controllo autenticazione
import DBDashboard from "./components/DBPage/DBDashboard";
const ErrorWrapper = () => {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const errorMap = {
    '401': {
      message: 'Utente non autenticato',
      gifUrl: '/gifs/401.gif',
      redirectTo: '/login'
    },
    '403': {
      message: 'Accesso vietato',
      gifUrl: '/gifs/403.gif',
    },
    '404': {
      message: 'Pagina non trovata',
      gifUrl: '/gifs/404.gif',
    },
    '500': {
      message: 'Errore interno del server',
      gifUrl: '/gifs/500.gif',
    }
  };

  const errorData = errorMap[code] || {
    message: 'Errore sconosciuto',
    gifUrl: '/gifs/default.gif',
  };

  const customMessage = searchParams.get('message');
  const message = customMessage || errorData.message;

  return <ErrorPage code={code} message={message} gifUrl={errorData.gifUrl} redirectTo={errorData.redirectTo} />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(""); // Stato per gestire il tipo di utente
  const [loading, setLoading] = useState(true); // Stato per gestire il caricamento

  useEffect(() => {
    const verifySession = async () => {
      const result = await checkSession();
      setIsAuthenticated(result.isAuthenticated);
      setUserType(result.userType); // Imposta il tipo di utente
      setLoading(false); // Fine del caricamento
    };

    verifySession();
  }, []);

  if (loading) {
    // Mostra un indicatore di caricamento mentre si verifica la sessione
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/error/:code" element={<ErrorWrapper />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/studentdashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review-explorer"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ReviewExplorer />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<ErrorPage code="404" message="Pagina non trovata" gifUrl="/gifs/404.gif" />} />
        <Route path="/dbdashboard" element={
          <ProtectedRoute 
            isAuthenticated={isAuthenticated} 
            userType={userType} 
            requiredRole="admin"
          >
            <DBDashboard />
          </ProtectedRoute>
        } />
        {/* Altre route qui */}
      </Routes>
    </Router>
  );
};

export default App;