/**
 * Created by hyw on 2016-11-08.
 */
var express = require("express");
var bodyParser = require("body-parser");
var mysql = require('mysql');
//multer : file upload
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'sourgrape'
    /*host : 'localhost',
     user : 'root',
     password : 'hywoong94!',
     database : 'sourgrape'*/
});
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.set('port', process.env.port || 3000);
app.locals.pretty = true;


connection.connect(function (err) {
    if (err) {
        console.log("Error Connecting DataBase ...\n");
    }
    else {
        console.log("DataBase is Connected !!!\n");
    }
});

app.get('/games', function (req, res) {
    var sql = 'select GameID,GameTitle from game';
    connection.query(sql, function (err, rows, fields) {
        res.setHeader('Access-Control_Allow_Origin','*');
        res.setHeader('Access-Control_Allow_Methods','POST, PUT, DELETE, GET');
        res.setHeader('Access-Control_Allow_Headers','Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

        res.setHeader('Cache-Control', 'no-cache');
        next();
        res.send(rows);
        //res.json(rows);
    });
});

app.listen(app.get('port'), function () {
    console.log("connection 3000 port");
});