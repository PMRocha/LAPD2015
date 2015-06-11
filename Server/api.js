var Connection = require('./lib/existdb-node');
var fs = require("fs");
var converters = require("./converters.js");
var passport = require('passport');

var options = {
    host: "172.30.4.200",
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
        console.log();
            if (hits == 0) {
                callback('Invalid credentials');
            }
            else {
                callback(item)
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
    var username = req.body.username;
    var password = req.body.password;

    var jsonObj = {
        "Username": username,
        "Password": password,
        "Wallet": {"cur": "EUR", "value": 1000}
    };
    data = converters.json2xml(jsonObj);
    data+='<Followed_Companies></Followed_Companies>';
    var xquery = 'xquery version "3.0"; return update insert '+data+' into doc("schema.xml")/Finance/Users';
    console.log(xquery);
    var query = connection.query(xquery, {chunkSize: 100});
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

exports.addStock = function (req, res) {
    var username = req.body.username;
    var stockCode = req.body.stock;
    var itemIterated;
    rowsJSON.some(function (item) {
            console.log(item);
            console.log('Teste item');
            if (item.Username == username) {
                itemIterated = item;
                return true;
            }
        }
    )
    var stocks = itemIterated.Followed_Companies;
    console.log(itemIterated.Followed_Companies);
    if (typeof(itemIterated.Followed_Companies) === 'object') {
        var companies = Array();
        companies.push(itemIterated.Followed_Companies);
        itemIterated.Followed_Companies = companies;
        itemIterated.Followed_Companies.forEach(function(item)
        {
            item=item.Followed_Company;
        });
    }
    var stock = {
            "Symbol": {"favourite": false, "value": req.body.stock},
            "Sell_rule": {
                "quantity": req.body.sellQuantity,
                "Ceiling": {
                    "cur": "US$",
                    "value": req.body.sellCeilingValue
                }
                ,
                "Floor": {
                    "cur": "US$",
                    "value": req.body.sellFloorValue
                }

            },
            "Buy_rule": {
                "quantity": req.body.buyQuantity,
                "Ceiling": {
                    "cur": "US$",
                    "value": req.body.buyCeilingValue
                }
                ,
                "Floor": {
                    "cur": "US$",
                    "value": req.body.buyFloorValue
                }

            },
            "Stocks_owned": "0",
            "Stocks_price": {
                "cur": "US$",
                "value": "0"
            }
    }
    itemIterated.Followed_Companies.push(stock);
    itemIterated.Followed_Companies={"Followed_Company":itemIterated.Followed_Companies};
    rowsJSON.some(function (item) {
        if (item.Username == username) {
            item = itemIterated;
            return true;
        }
    });
    var data = {"Finance": {"Users": {"User": rowsJSON}}};

    data = converters.json2xml({"Followed_Company": stock});
    var xquery = 'xquery version "3.0"; for $user in doc("schema.xml")/Finance/Users/User where $user/Username="' + username + '" return update insert '+data+' into $user/Followed_Companies';
    console.log(xquery);
    var query = connection.query(xquery, {chunkSize: 100});
    query.on("error", function (parameters) {
        var err = parameters.err;
        console.log("An error occurred: " + parameters);
    });
    query.each
    (function (item, hits, offset) {
        if (hits == 0) {
            res.status(200).send('Success');
        }
    });

};

exports.buyStock = function (req, res) {
    var username = req.body.username;
    var stockCode = req.body.stock;
    var price = req.body.price;
    var itemIterated;
    rowsJSON.some(function (item) {
            if (item.Username == username) {
                if(parseFloat(item.Wallet.value)>=parseFloat(price))
                {
                    item.Wallet.value=parseFloat(item.Wallet.value)-parseFloat(price);
                itemIterated = item;
                return true;
                }
                else res.status(400).send('Not enough money to buy that action');
            }
        }
    )
    var stocks = itemIterated.Followed_Companies;
    if (! itemIterated.Followed_Companies.Followed_Company instanceof Array) {
        var companies = Array();
        companies.push(itemIterated.Followed_Companies.Followed_Company);
        itemIterated.Followed_Companies.Followed_Company = companies;
    }
    var stock;
    var found=false;
        for(var i=0;i<itemIterated.Followed_Companies.Followed_Company.length;i++)
        {
        console.log('Testing 3');
            console.log(itemIterated.Followed_Companies.Followed_Company[i]);
        if (itemIterated.Followed_Companies.Followed_Company[i].Symbol.value == stockCode) {
            console.log('YAY');
            stock = itemIterated.Followed_Companies.Followed_Company[i];
            stock.Stocks_owned = parseInt(stock.Stocks_owned) + 1;
            stock.Stocks_owned = stock.Stocks_owned.toString();
            stock.Stocks_price.value = price;
            itemIterated.Followed_Companies.Followed_Company.splice(i,1);
            found = true;
            i=itemIterated.Followed_Companies.Followed_Company.length;
        }
    }
    if(!found)
        stock = {
        "Symbol": {"favourite": false, "value": req.body.stock},
        "Sell_rule": {
            "quantity": 0,
            "Ceiling": {
                "cur": "US$",
                "value": 0
            }
            ,
            "Floor": {
                "cur": "US$",
                "value": 0
            }

        },
        "Buy_rule": {
            "quantity": 0,
            "Ceiling": {
                "cur": "US$",
                "value": 0
            }
            ,
            "Floor": {
                "cur": "US$",
                "value": 0
            }

        },
        "Stocks_owned": "1",
        "Stocks_price": {
            "cur": "US$",
            "value": price
        }
    }
    itemIterated.Followed_Companies.Followed_Company.push(stock);
    var data = {};
    rowsJSON.some(function (item) {
            if (item.Username == username) {
                item = itemIterated;
                return true;
            }
        }
    )
    data = converters.json2xml({"Finance":{"Users":{"User":rowsJSON}}});
    var xquery_1='xquery version "3.0"; for $user in doc("schema.xml")/Finance/Users/User where $user/Username="' + username + '" return update delete $user//Followed_Company[Symbol/value="'+stockCode+'"]';
    fs.writeFile("schema.XML",data,function(err)
    {
        if(err)
        console.log(err);
        console.log('Checking');
        connection.store("schema.xml","schema.xml",function(err)
        {
            if(err)
            console.log(err);
            else
            res.send('Success');
        })
        return true;
    })

};
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
