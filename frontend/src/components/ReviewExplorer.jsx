import React, { useState, useEffect,useCallback } from 'react';

import Header from './Header'; // Importa il componente Header
import '../styles/Explorer.css';

const ReviewExplorer = () => {
    const [files, setFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState('');
    const [parentDir, setParentDir] = useState('');
    const [error, setError] = useState('');

    const initializeExplorer = useCallback(async () => {
        try {
            // Logica per inizializzare l'explorer
            await fetchFiles();
        } catch (err) {
            setError(err.message || 'Errore sconosciuto');
        }
    }, []);

    // Funzione per gestire il caricamento dei file
    useEffect(() => {
        document.title = 'File Explorer';
        initializeExplorer();
    }, [initializeExplorer]);


    const fetchFiles = async (dir = '') => {
            const response = await fetch(`/api/get-personal-review-folder?dir=${dir}`);
            const data = await response.json();

            if (response.ok) {
                const sortedFiles = data.files.sort((a, b) => {
                    if (a.type === 'directory' && b.type !== 'directory') {
                        return -1;
                    }
                    if (a.type !== 'directory' && b.type === 'directory') {
                        return 1;
                    }
                    return a.name.localeCompare(b.name);
                });

                setFiles(sortedFiles);
                setCurrentPath(data.currentPath);
                setParentDir(data.parentDir);
                setError(''); // Resetta l'errore se tutto va bene
            } else {
                throw new Error(data.error || 'Errore durante il recupero dei file');
            }
    };

    const handleNavigate = (dir) => {
        fetchFiles(dir === '.' ? '' : dir).catch((err) => setError(err.message));
    };

    const handleDownload = (filePath) => {
        window.open(`/api/get-file?file=${encodeURIComponent(filePath)}`, '_blank');
    };

    return (
        <>
            <Header title="File Explorer" backgroundClass="explorer-header" />
            <main>
                {error && (
                    <div className="error-container">
                        <p style={{ color: 'red' }}>{error}</p>
                    </div>
                )}
                {!error && (
                    <>
                        <div className="breadcrumb-container">
                            {parentDir && (
                                <button
                                    id="back-button"
                                    onClick={() => handleNavigate(parentDir)}
                                >
                                    ↰
                                </button>
                            )}
                            <p className="breadcrumb">
                                {currentPath
                                    ? currentPath.split('/').map((segment, index, arr) => (
                                          <span key={index}>
                                              {index < arr.length - 1 ? (
                                                  <>
                                                      <span className="breadcrumb-segment">{segment}</span>
                                                      <span className="breadcrumb-divider">/</span>
                                                  </>
                                              ) : (
                                                  <>
                                                      <span>~/Root/</span>
                                                      <span className="breadcrumb-current">{segment}</span>
                                                  </>
                                              )}
                                          </span>
                                      ))
                                    : '~/Root'}
                            </p>
                        </div>
                        <ul>
                            {files.map((file) => (
                                <li key={file.path}>
                                    {file.type === 'directory' ? (
                                        <button onClick={() => handleNavigate(file.path)}>📂 {file.name}</button>
                                    ) : (
                                        <button onClick={() => handleDownload(file.path)}>📄 {file.name}</button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </main>
        </>
    );
};

export default ReviewExplorer;