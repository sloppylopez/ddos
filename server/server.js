var express = require('express');
var app = express();
var morgan = require('morgan');

app.use(morgan());

app.get('/', function (req, res) {
    res.send('hello world')
});

app.listen(3000);
