// Funzione per verificare se l'utente è autenticato
export const checkSession = async () => {
    try {
        const response = await fetch('/api/isAuthenticated', {
            credentials: 'include', // Include i cookie nella richiesta
        });

        if (response.status === 401) {
            localStorage.removeItem('user');
            return { isAuthenticated: false };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Errore durante la verifica della sessione:', error);
        return { isAuthenticated: false };
    }
};