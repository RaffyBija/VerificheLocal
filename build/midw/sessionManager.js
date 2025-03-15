let inSessions = [];

function addSession(sessionID, userID, isAuthenticated) {
    inSessions.push({ sessionID, userID, isAuthenticated });
}

function removeSession(userID) {
    inSessions = inSessions.filter(info => info.userID !== userID);
}

function getSessions() {
    return inSessions;
}

module.exports = {
    addSession,
    removeSession,
    getSessions
};
