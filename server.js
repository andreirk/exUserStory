var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    config = require('./config');

app = express();

mongoose.connect(config.database, function (err){
    if(err){
        console.log(err);
    } else {
        console.log('Connected to database');
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));


app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/views/index.html');
});

app.listen(config.port, function(err){
    if(err){
        console.log('Failsd to boot server up');
    }
    console.log('Server has started'); 
});