const Limit = require("express-rate-limit");

const limiter = Limit({
    windowMs: 60 * 1000,
    max: 3,
    message: "Vous avez dépassé le nombre maximal de tentatives."
});

module.exports = limiter; 