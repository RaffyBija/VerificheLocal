let cacheTest = {
    quizInfo: {
        type: "",
        title: ""
    },
    quizData: []
};

let sessionCache = [];

function containsObject(arr, obj) {
    return arr.some(existingObj => parseInt(existingObj.user.ID) === parseInt(obj.user.ID));
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
    //console.log("Cache reset:", cacheTest, sessionCache);
}

function getCacheTest() {
    return cacheTest;
}

function getSessionCache() {
    return sessionCache;
}

module.exports = {
    getCacheTest,
    getSessionCache,
    containsObject,
    addSession,
    resetCache
};