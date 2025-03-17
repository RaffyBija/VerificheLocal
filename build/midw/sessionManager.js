let inSessions = [];

function addSession(sessionID, userID, isAuthenticated) {
    inSessions.push({ sessionID, userID, isAuthenticated });
}

function getSessions() {
    return inSessions;
}

function getSession(userID) {
    return inSessions.find(info => info.userID === userID);
}


module.exports = {
    addSession,
    getSessions,
    getSession
};
