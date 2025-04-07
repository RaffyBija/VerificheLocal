import React, { useEffect } from "react";
import '../styles/ErrorPage.css'; // Importa il tuo file CSS per lo stile

const ErrorPage = ({code, message, gifUrl, redirectTo}) =>{
    useEffect(() => {
        document.title = `Errore ${code}`;
        if(code==='401'&& redirectTo){
            const timer = setTimeout(() => {
                window.location.href= redirectTo;
            },2000);
            return () => clearTimeout(timer);
        } 
    },[code, redirectTo]);

    return(
        <div className="error-container">
            <h1>{code}</h1>
            <p>{message}</p>
            <img src={gifUrl} alt={`Error ${code}`} />
            {code === '401' && redirectTo && (
                <p>Verrai reindirizzato alla pagina di login...</p>
            )}
        </div>
    );
}

export default ErrorPage;   
