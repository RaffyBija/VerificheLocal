// Funzione per verificare se l'utente è autenticato
export const checkSession = async () => {
    try {
        const response = await fetch('/api/isAuthenticated', {
            credentials: 'include' // Include i cookie nella richiesta
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { isAuthenticated: false };
    }
};