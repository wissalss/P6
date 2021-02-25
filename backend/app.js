const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');


const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const app = express();

dotenv.config({
    path: './.env'
});

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


app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);



module.exports = app;