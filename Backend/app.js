require('dotenv').config();
const express = require('express');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const app = express();
const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');



connectToDb();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
    res.send("hello world");
});

app.use('/users', userRoutes);
app.use('/captains', captainRoutes);

module.exports = app;
