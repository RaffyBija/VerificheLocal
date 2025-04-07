// Funzione per salvare l'username nei cookie
export const saveUsername = (username) => {
    document.cookie = `username=${encodeURIComponent(username)}; path=/; max-age=86400`; // Valido per 1 giorno
};

// Funzione per recuperare l'username dai cookie
export const getUsernameFromCookie = () => {
    const match = document.cookie.match(/(?:^|; )username=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
};

// Funzione per eliminare l'username dai cookie
export const clearUsername = () => {
    document.cookie = 'username=; path=/; max-age=0'; // Imposta il cookie con max-age=0 per eliminarlo
};

// Funzione per recuperare l'username dall'API (se non presente nei cookie)
export const fetchUsername = async () => {
    const cachedUsername = getUsernameFromCookie();
    if (cachedUsername) {
        return cachedUsername; // Restituisce l'username dai cookie se disponibile
    }

    // Effettua la fetch all'API
    const response = await fetch('/api/get-username');
    const data = await response.json();

    if (response.ok) {
        saveUsername(data.username); // Salva l'username nei cookie
        return data.username;
    } else {
        throw new Error(data.error || 'Errore durante il recupero del nome utente');
    }
};

// Funzione per salvare la classe nei cookie
export const saveUserClass = (userClass) => {
    document.cookie = `userClass=${encodeURIComponent(userClass)}; path=/; max-age=86400`; // Valido per 1 giorno
};
// Funzione per recuperare la classe dai cookie
export const getUserClassFromCookie = () => {
    const match = document.cookie.match(/(?:^|; )userClass=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
};

export const fetchUserClass = async () => {
    const cachedClass = getUserClassFromCookie();
    if (cachedClass) {
        return cachedClass; // Restituisce la classe dai cookie se disponibile
    }
    // Effettua la fetch all'API
    const response = await fetch('/api/get-user-class');
    const data = await response.json();
    if (response.ok) {
        saveUserClass(data.classe); // Salva la classe nei cookie
        return data.classe;
    } else {
        throw new Error(data.error || 'Errore durante il recupero della classe');
    }
}

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