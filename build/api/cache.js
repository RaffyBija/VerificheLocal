let cacheTest = {
    quizInfo: {
        type: "",
        title: ""
    },
    quizData: []
};

let sessionCache = [];

function containsObject(arr, obj) {
    return arr.some(existingObj => parseInt(existingObj.userID) === parseInt(obj.userID));
}

function addSession(session) {
    if (!containsObject(sessionCache, session)) {
        sessionCache.push(session);
    }
}

function resetCache() {
    cacheTest = {
        quizInfo: { type: "", title: "" },
        quizData: []
    };
    sessionCache = [];
}

module.exports = {
    cacheTest,
    sessionCache,
    containsObject,
    addSession,
    resetCache
};