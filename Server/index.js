var express = require('express');
var Connection = require('./lib/existdb-node');
var fs = require("fs");
var async = require("async");
var app = express();

var options = {
    host: "localhost",
    port: 8080,
    rest: "/exist/rest/db/apps/bolsaML",
    auth: "admin:admin"
};
var connection = new Connection(options);
var result=false;
var rowsJSON=[];
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send('Hello World from BolsaML!');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var getUsers=function(connection)
{
var xquery = fs.readFileSync("list-users.xql", "UTF-8");

var query = connection.query(xquery, { chunkSize: 100 });
query.on("error", function(err) {
    console.log("An error occurred: " + err);
});

    async.whilst
    (
        function()
        {
            console.log('In testing');
            return !result;
        },
        function()
        {
            result=query.each
            (function(rows) 
            {
                rowsJSON.push(rows.User);
            }
            );
        },
        function()
        {
            return true;
        }
    )
};

var login=function(connection,username,password)
{
console.log(JSON.stringify(rowsJSON));

}
var signup=function(connection,username,password)
{
var xquery = fs.readFileSync("list-users.xql", "UTF-8");

var query = connection.query(xquery, { chunkSize: 100 });
query.on("error", function(err) {
    console.log("An error occurred: " + err);
});
var l = 0;
query.each(function(rows) {
    rowsJSON.push(rows.User);
    console.log(JSON.stringify(rowsJSON));
})
var jsonObj={"User":{"Username":username,"Password":password}};
var obj=json2xml(jsonObj);
var objXML='<User><Username>Test</Username><Password>qwerty</Password><Wallet cur="US$">10000</Wallet><Followed_Companies><Followed_Company><Symbol favourite="true">COM</Symbol><Sell_rule quantity="10"><Ceiling cur="US$">30</Ceiling><Floor cur="US$">20</Floor></Sell_rule><Buy_rule quantity="10"><Ceiling cur="US$">15</Ceiling><Floor cur="US$">5</Floor></Buy_rule><Stocks_owned>1000</Stocks_owned><Stocks_price cur="US$">2.36</Stocks_price></Followed_Company></Followed_Companies></User>'
var queryString='xquery version "3.0"; insert '+objXML+' into doc("schema.xml")/Finance/Users';
console.log(queryString);
var query = connection.query(queryString, { chunkSize: 100 });
query.on("error", function(err) {
    console.log("An error occurred: " + err);
});
async.whilst(
    function()
    {
        console.log('In testing');
        return !result;
    },
    function()
    {
        result=query.each(function(rows) {
    if(rows.User.Username==username && rows.User.Password==password)
        console.log('Good credentials for '+rows.User.Username);
    else
        if(rows.User.Username==username)
        {
        console.log('Invalid credentials for ' + rows.User.Username);
        return false;
        }
    })
    },

    );

}
async.whilst(
    function()
    {

    }
)
getUsers(connection);
//signup(connection,"john","1234");

/**
Using functions

connection.store(source,destination,callback); --stores document in source with file name destination in bolsaML db


*/

function json2xml(o) {
    tab="";
   var toXml = function(v, name, ind) {
      var xml = "";
      if (v instanceof Array) {
         for (var i=0, n=v.length; i<n; i++)
            xml += ind + toXml(v[i], name, ind+"\t") + "\n";
      }
      else if (typeof(v) == "object") {
         var hasChild = false;
         xml += ind + "<" + name;
         for (var m in v) {
            if (m.charAt(0) == "@")
               xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
            else
               hasChild = true;
         }
         xml += hasChild ? ">" : "/>";
         if (hasChild) {
            for (var m in v) {
               if (m == "#text")
                  xml += v[m];
               else if (m == "#cdata")
                  xml += "<![CDATA[" + v[m] + "]]>";
               else if (m.charAt(0) != "@")
                  xml += toXml(v[m], m, ind+"\t");
            }
            xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
         }
      }
      else {
         xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
      }
      return xml;
   }, xml="";
   for (var m in o)
      xml += toXml(o[m], m, "");
   return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}