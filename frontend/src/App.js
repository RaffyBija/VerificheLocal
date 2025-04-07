import React from "react";
import {BrowserRouter as Router, Routes, Route, useParams, useSearchParams} from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ReviewExplorer from "./components/ReviewExplorer";

const ErrorWrapper = () => {
  const {code} = useParams();
  const [searchParams] = useSearchParams();
  const errorMap ={
    '401': {
      message: 'Accesso non autorizzato',
      gifUrl: '/gifs/401.gif',
      redirectTo: '/login'
    },
    '404':{
      message: 'Pagina non trovata',
      gifUrl: '/gifs/404.gif',
      },
    '500':{
      message: 'Errore interno del server',
      gifUrl: '/gifs/500.gif',
      }
  };

  const errorData = errorMap[code] || {
    message: 'Errore sconosciuto',
    gifUrl: '/gifs/default.gif',
    };

  const customMessage= searchParams.get('message');
  const message = customMessage || errorData.message;
  
    return <ErrorPage code={code} message={message} gifUrl={errorData.gifUrl} redirectTo={errorData.redirectTo} />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/error/:code" element={<ErrorWrapper />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/' element={<Home />} />
                <Route path='/review-explorer' element={<ReviewExplorer />} />
                <Route path='*' element={<ErrorPage code="404" message="Pagina non trovata" gifUrl="/gifs/404.gif" />} />
                {/* Altre route qui */}
            </Routes>
        </Router>
    );
}
export default App;