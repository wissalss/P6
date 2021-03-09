const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const app = express();

//pour sécuriser les cookies de session
const session = require("./middleware/session");

//Package helmet (pour sécuriser les données et les connexions)
const helmet = require("helmet");

//Package hpp (pour protéger le système contre les attaques de pollution des paramètres HTTP)
const hpp = require("hpp");

//Middleware limiter.js contre le "brute force" 
const limit = require("./middleware/limit");

//Package mongo-express-sanitize : validation des données, enlève les données qui commencent par $.
const mongoSanitize = require("express-mongo-sanitize");


const mongoUrl = process.env.MONGOOSE_URL;
mongoose.connect(mongoUrl)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.log('Unable to connect to Mongo DB Atlas');
        console.error(error);
    });

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.use(helmet());
app.use(hpp());
app.use("/api/auth", limit);
app.use(express.urlencoded({ limit: "1kb" }));
app.use(express.json({ limit: "1kb" }));
app.use(session);

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));



module.exports = app;