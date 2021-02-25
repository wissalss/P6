const expressSession = require("express-session");

var expiryDate = new Date(Date.now() + 60 * 60 * 1000)

const session = expressSession({
    secret: "max",
    name: "sessionId",
    cookie: { secure: true, httpOnly: true, sameSite: true, path: "/api/", expires: expiryDate }
});

module.exports = session;