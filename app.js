var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors')
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 'extended': 'false' }));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));


var whitelist = ['http://localhost:4200', 'http://cscfutsal.com']
var corsOptions = {
    origin: function(origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

mongoose.Promise = global.Promise;
var options = {
    useMongoClient: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
};


mongoose.connect('mongodb://mongo:27017/cscfutsaldb1920', options, function(err, res) {
    if (err) throw err;
    console.log('Connected to database');
});

var jugador = require('./api/controllers/jugadorController');
var equipo = require('./api/controllers/equipoController');
var admin = require('./api/controllers/adminController');
var cronica = require('./api/controllers/cronicaController');

app.use('/jugador', cors(corsOptions), jugador);
app.use('/equipo', cors(corsOptions), equipo);
app.use('/admin', cors(corsOptions), admin);
app.use('/cronica', cors(corsOptions), cronica);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;