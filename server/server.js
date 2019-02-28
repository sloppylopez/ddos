var express = require('express');
var app = express();
var morgan = require('morgan');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// process.env.HTTP_PROXY = 'http://localhost:8888';
app.use(morgan());

app.get('/', function (req, res) {
    res.send('hello world')
});

app.listen(3000);
