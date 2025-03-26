const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..'); // Directory principale del progetto
const STORAGE_DIR = path.join(ROOT_DIR, 'storage');
const BUILD_DIR = path.join(ROOT_DIR,'build');
module.exports = {
    ROOT_DIR,
    STORAGE_DIR,
    BUILD_DIR,
    UPLOADS_DIR: path.join(STORAGE_DIR, 'uploads'),
    CORRECTIONS_DIR: path.join(STORAGE_DIR, 'correzioni'),
    VERIFICHE_DIR: path.join(STORAGE_DIR,'verifiche'),
    PUBLIC_DIR: path.join(BUILD_DIR, 'public'),
    PRIVATE_DIR: path.join(BUILD_DIR,'nopublic')
};