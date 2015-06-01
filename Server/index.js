var express = require('express');
var cors = require('cors');
var bodyparser = require('body-parser');
var api = require("./api.js");
var app = express();
app.use(cors());
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function (request, response) {
    response.send('Hello World from BolsaML!');
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

api.getData();

app.post('/login', function (req, res) {
    return api.login(req, res);
});
app.post('/signup', function (req, res) {
    api.signup(req, res)
});

app.get('/watchList/:username', api.getWatchList);
