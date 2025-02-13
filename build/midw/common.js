const bcrypt = require('bcrypt'); // Hasing unidirezionale. Con Bycripy non si ha la possibilità di decriptare
const crypto = require('crypto'); // Libreria di Node.js per crittografare e decrittografare le password.

// Configurazione delle chiavi e dell'algoritmo di crittografia
const secretKey = process.env.SECURE_KEY;
const fixedKey = crypto.createHash('sha256').update(secretKey).digest(); // Assicura che sia esattamente 32 byte
const algorithm = 'aes-256-cbc';

// Funzioni di crittografia e decrittografia
function encryptPassword(password) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(fixedKey), iv);
    let encrypted = cipher.update(password, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

function decryptPassword(encryptedPassword) {
    const [iv, encrypted] = encryptedPassword.split(':');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(fixedKey), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}

function matchPassword(encryptedPassword, userPassword) {
    try {
        const decryptedPassword = decryptPassword(encryptedPassword);
        return decryptedPassword === userPassword;
    } catch (err) {
        console.log(err);
        return;
    }
}

module.exports = {
    // Middleware per verificare se l'utente è loggato
    checkAuth: (req, res, next)=> {
        if (req.session.isAuthenticated) {
            next();
        } else {
            res.status(401).set('Content-Type', 'text/html').send(`
                <html>
                    <head>
                        <title>Unauthorized</title>
                        <meta http-equiv="refresh" content="2;url=/login" />
                    </head>
                    <body>
                        <h1>Unauthorized: Please log in</h1>
                        <p>Verrai reindirizzato alla pagina di login tra pochi secondi...</p>
                    </body>
                </html>
            `);
        }
    },
    encryptPassword,
    decryptPassword,
    matchPassword,
};