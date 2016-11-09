/**
 * Created by hyw on 2016-11-08.
 */
var express = require("express");
var bodyParser = require("body-parser");
var mysql = require('mysql');
//multer : file upload
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '1234',
    database : 'sourgrape'
    /*host : 'localhost',
    user : 'root',
    password : 'hywoong94!',
    database : 'sourgrape'*/
});
var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.locals.pretty = true;


connection.connect(function (err){
   if(err){
       console.log("Error Connecting DataBase ...\n");
   }
   else{
       console.log("DataBase is Connected !!!\n");
   }
});

app.get('/games', function (req,res) {
    var sql = 'select GameID,GameTitle from game';
    connection.query(sql,function (err, rows, fields){
        res.send(rows);
        //res.json(rows);
    });
});

app.listen(4200,function(){
   console.log("connection 4200 port");
});