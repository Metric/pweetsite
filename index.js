'use strict';

const fs = require('fs');
const path = require('path');
const Express = require('express');
const app = Express();

app.use(function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Methods', '*');
    return next();
});

app.options('*', function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Methods', '*');
    res.set('Content-Type', req.headers['Content-Type']);
    return next();
});

app.use(Express.static('public'));

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream(path.join(__dirname, 'public', 'index.html')).pipe(res);
});

app.listen(7000, () => console.log('listening on port 7000'));