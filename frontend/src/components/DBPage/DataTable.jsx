import React from 'react';
import RecordActions from './RecordActions';
import '../../styles/DataTable.css';

const DataTable = ({ data, setData, onEdit, handleDelete }) => {
    return (
        <table className="data-table">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>ID</th>
                    <th>Cognome</th>
                    <th>Nome</th>
                    <th>Classe</th>
                    <th>Username</th>
                    <th>Azioni</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row) => (
                    <tr key={row.ID}>
                        <td className={row.isOnline? "online":""}>{row.isOnline ? 'Online' : 'Offline'}</td>
                        <td>{row.ID}</td>
                        <td>{row.Cognome}</td>
                        <td>{row.Nome}</td>
                        <td>{row.Classe}</td>
                        <td>{row.Username}</td>
                        <td>
                            <RecordActions
                                row={row}
                                handleDelete={handleDelete}
                                onEdit={onEdit}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default DataTable;