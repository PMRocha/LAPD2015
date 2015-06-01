var Connection = require('./lib/existdb-node');
var fs = require("fs");
var converters = require("./converters.js");
var passport = require('passport');

var options = {
    host: "localhost",
    port: 8080,
    rest: "/exist/rest/db/apps/bolsaML",
    auth: "admin:admin"
};
var connection = new Connection(options);
var result = false;
var rowsJSON = [];

var exports = module.exports = {}
exports.executeFunction = function (afterGetFunction, afterGetParameters) {
    var xquery = fs.readFileSync("list-users.xql", "UTF-8");

    var query = connection.query(xquery, {chunkSize: 100});
    query.on("error", function (err) {
        console.log("An error occurred: " + err);
    });
    result = query.each
    (function (item, hits, offset) {
            rowsJSON.push(item);
            if (hits == offset) {
                afterGetFunction(afterGetParameters);
                return true;
            }

        }
    );
};
exports.getData = function () {
    var xquery = fs.readFileSync("list-users.xql", "UTF-8");

    var query = connection.query(xquery, {chunkSize: 100});
    query.on("error", function (err) {
        console.log("An error occurred: " + err);
    });
    result = query.each
    (function (item, hits, offset) {
            rowsJSON.push(item);
            if (hits == offset) {
                return true;
            }

        }
    );
}
var login = function (username, password, callback) {
    var result;
    console.log(username);
    console.log(password);
    var query = connection.query('xquery version "3.0"; for $user in doc("schema.xml")/Finance/Users/User where $user/Username="' + username + '" and $user/Password="' + password + '" return $user', {chunkSize: 100});
    query.on("error", function (err) {
        console.log("An error occurred: " + err);
    });
    result = query.each
    (function (item, hits, offset) {
            if (hits == 0) {
                callback('Invalid credentials');
            }
            else {
                callback()
            }
        }
    );


}
exports.login = function (req, res) {
    login(req.body.username, req.body.password, function (result) {
        if (result == undefined) {
            if (req.session == undefined)
                req.session = {};
            req.session.user_id = req.body.username;
            res.send('OK');
        }
        else
            res.status(400).send(result);
    });
}
exports.signup = function (req, res) {
    console.log(req);
    console.log(res);
}

var signup = function (parameters) {
    var username = parameters[0];
    var password = parameters[1];

    var jsonObj = {
        "Username": username,
        "Password": password,
        "Wallet": {"cur": "EUR", "#text": 1000},
        "Followed_Companies": Array()
    };
    rowsJSON.push(jsonObj);
    var data = {"Finance": {"Users": {"User": rowsJSON}}};
    data = converters.json2xml(data);
    fs.writeFile("./schema.xml", data, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('File saved!');
        connection.store("./schema.xml", "schema.xml", function (err) {
            if (err)
                return console.log(err);
            console.log('Users stored!');
        })
    })
}

var addToWatchlist = function (parameters) {
    var connection = parameters[0];
    var username = parameters[1];
    var password = parameters[2];

    var jsonObj = {
        "Username": username,
        "Password": password,
        "Wallet": {"cur": "EUR", "#text": 1000},
        "Followed_Companies": Array()
    };
    rowsJSON.push(jsonObj);
    var data = {"Finance": {"Users": {"User": rowsJSON}}};
    data = converters.json2xml(data);
    fs.writeFile("./schema.xml", data, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('File saved!');
        connection.store("./schema.xml", "schema.xml", function (err) {
            if (err)
                return console.log(err);
            console.log(err);
        })
    })
}

exports.getWatchList = function (req, res) {
    var username = req.params.username;
    var result = Array();
    var query = connection.query('xquery version "3.0"; declare variable $collection external; declare option exist:serialize "method=json media-type=application/json";for $user in doc("schema.xml")/Finance/Users/User where $user/Username="' + username + '" return $user/Followed_Companies/Followed_Company', {chunkSize: 100});
    query.on("error", function (parameters) {
        var err = parameters.err;
        console.log("An error occurred: " + parameters);
    });
    query.each
    (function (item, hits, offset) {
        if (hits == 0) {
            res.status(400).send([]);
        }
        else {
            result.push(item);
            if (hits == offset)
                res.status(200).send(result);
        }
    });

}