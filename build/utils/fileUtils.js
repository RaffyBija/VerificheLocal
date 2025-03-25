const fs = require('fs');
const path = require('path');

/**
 * Verifica se una directory esiste, altrimenti la crea.
 * @param {string} dirPath - Percorso della directory.
 */
function ensureDirectoryExists(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    } catch (err) {
        console.error(`Errore durante la creazione della directory: ${dirPath}`, err);
        throw err;
    }
}

/**
 * Ottiene la struttura di una directory, inclusi file e sottodirectory.
 * @param {string} dirPath - Percorso della directory.
 * @returns {Array} - Lista di oggetti con tipo (file o directory), nome e percorso.
 */
function getDirectoryStructure(dirPath) {
    const result = [];
    try {
        const items = fs.readdirSync(dirPath);

        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                result.push({ type: 'directory', name: item, path: fullPath });
            } else {
                result.push({ type: 'file', name: item, path: fullPath });
            }
        });
    } catch (err) {
        console.error(`Errore durante la lettura della directory: ${dirPath}`, err);
        return [];
    }
    return result;
}

/**
 * Elimina una directory e tutto il suo contenuto.
 * @param {string} dirPath - Percorso della directory.
 */
function deleteDirectory(dirPath) {
    try {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`Directory eliminata: ${dirPath}`);
        } else {
            console.warn(`Directory non trovata: ${dirPath}`);
        }
    } catch (err) {
        console.error(`Errore durante l'eliminazione della directory: ${dirPath}`, err);
        throw err;
    }
}

/**
 * Genera un nome file univoco se il file esiste già nella directory.
 * @param {string} baseDir - Directory di base.
 * @param {string} originalName - Nome originale del file.
 * @returns {string} - Nome file univoco.
 */
function generateUniqueFileName(baseDir, originalName) {
    let fileName = originalName;
    let filePath = path.join(baseDir, fileName);
    let counter = 1;

    while (fs.existsSync(filePath)) {
        const name = path.parse(originalName).name;
        const ext = path.parse(originalName).ext;
        fileName = `${name}(${counter})${ext}`;
        filePath = path.join(baseDir, fileName);
        counter++;
    }

    return fileName;
}

module.exports = {
    ensureDirectoryExists,
    getDirectoryStructure,
    deleteDirectory,
    generateUniqueFileName
};