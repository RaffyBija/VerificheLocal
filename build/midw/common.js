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
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f8f9fa;
                                color: #343a40;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                            }
                            .container {
                                text-align: center;
                                background: #ffffff;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            }
                            img {
                                max-width: 500px;
                                margin-bottom: 20px;
                            }
                            p {
                                font-size: 16px;
                                margin: 10px 0;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <img src="/img/9ptgeo.gif" alt="401 Error" />
                            <p>Verrai reindirizzato alla pagina di login tra pochi secondi...</p>
                        </div>
                    </body>
                </html>
            `);
        }
    },
    encryptPassword,
    decryptPassword,
    matchPassword,
};