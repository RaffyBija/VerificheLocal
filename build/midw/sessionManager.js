let inSessions = [];

function addSession(sessionID, userID, isAuthenticated) {
        inSessions.push({ sessionID, userID, isAuthenticated });
}
function removeSession(sessionID, userID) {
    inSessions = inSessions.filter(a => a.sessionID !== sessionID || a.userID !== userID);
}
function getSessions() {
    return inSessions;
}

function getSession(userID) {
    return inSessions.find(info => info.userID === userID);
}

function sessionExists(sessionID, userID) {
    return inSessions.some(a => a.sessionID === sessionID && a.userID === userID);
}


module.exports = {
    addSession,
    getSessions,
    removeSession,
    getSession,
    sessionExists
};
