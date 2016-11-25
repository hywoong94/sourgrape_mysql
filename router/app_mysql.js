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
     //database: 'testhost'
     database: 'sourgrape'

    /*host: 'localhost',
    user: 'root',
    password: 'hywoong94!',
    database: 'sourgrape'*/
});
var app = express();

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
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
    var sql = 'select * from game';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});
app.get('/game-rate', function (req, res) {
    var sql = 'SELECT gr_title, gr_id, round(avg(rate),1) as rate, rate_date FROM game_rate group by gr_title order by rate desc;';
    connection.query(sql, function (err, rows, fields) {
        //res.send(rows);
        res.json(rows);
    });
});
app.get('/game/:title', function (req, res) {
    var sql = 'select * from game where title = "' + req.params.title + '"';
    connection.query(sql, function (err, rows, fields) {
        //res.send(rows);
        res.json(rows);
    });
});
app.get('/game-rate/:title', function (req, res) {
    var sql = 'select gr_title, gr_id, round(avg(rate),1) as rate, rate_date from game_rate where gr_title = "' + req.params.title + '"';
    connection.query(sql, function (err, rows, fields) {
        //res.send(rows);
        res.json(rows);
    });
});
app.get('/search/:keyword', function (req, res) {
    var sql = 'select * from game where title like "%' + req.params.keyword + '%"';
    connection.query(sql, function (err, rows, fields) {
        //res.send(rows);
        res.json(rows);
    });
});
app.get('/game-rate/:title/:id', function (req, res) {
    var sql = 'select * from game_rate where gr_title = "' + req.params.title + '" AND gr_id = "' + req.params.id + '"';
    connection.query(sql, function (err, rows, fields) {
        //res.send(rows);
        res.json(rows);
    });
});
app.get('/game-rates/:id', function (req, res) {
    var sql = 'select * from game_rate where gr_id = "' + req.params.id + '"';
    connection.query(sql, function (err, rows, fields) {
        //res.send(rows);
        res.json(rows);
    });
});
app.get('/user/:id', function (req, res) {
    var sql = 'select * from user where id = "' + req.params.id + '"';
    connection.query(sql, function (err, rows, fields) {
        //res.send(rows);
        res.json(rows);
    });
});
app.post('/users', function (req, res) {
    var user = {
        "id": req.body.id,
        "password": req.body.password,
        "name": req.body.name
    };
    var sql = 'insert into user values ("' + req.body.id + '", "' + req.body.password + '", "' + req.body.name + '")';
    //var sql = 'insert into user set ?';
    connection.query(sql, user, function (err, result) {
        //res.send(rows);
        if (err) {
            console.error(err);
            connection.rollback(function () {
                console.error('rollback error');
                throw err;
            });
        }// if err
    });
});
app.get('/users/:id/:num', function (req, res) {
    var sql = 'select * from user where id != "' + req.params.id + '" limit ' + req.params.num;
    connection.query(sql, function (err, rows, fields) {
        //res.send(rows);
        res.json(rows);
    });
});
app.get('/cal-simScore', function (req, res) {
    var arryK = [];
    var arryL = [];
    var sql = 'select id from user';
    connection.query(sql, function (err, rows, fileds) {
        for (var i = 0; i < rows.length; i++) {
            arryK.push(rows[i]);
            arryL.push(rows[i]);
        }
        var simScore = '';
        for(var k = 0; k < arryK.length; k++) {
            for( var l = 0; l < arryL.length; l++) {
                if(k < l) {
                    simScore +=  arryK[k].id + ', ' +  arryL[l].id + ', ' + calculSimScore(arryK[k].id, arryL[l].id) + '<br>';
                }
            }
        }
        res.send(simScore);
    });
});
function calculSimScore(k_id, l_id){
    sql = 'select exceptAVG.game_title, k, k_rate, l, l_rate, avgRate ' +
        'from ' +
        '(' +
        'SELECT KT.gr_title as game_title , KT.gr_id as k, KT.rate as k_rate, LT.gr_id as l, LT.rate as l_rate ' +
        'FROM ' +
        '(select * from game_rate where gr_id = "' + k_id + '") as KT , ' +
        '(select * from game_rate where gr_id = "' + l_id + '") as LT where KT.gr_title in (LT.gr_title)' +
        ') as exceptAVG ' +
        'join ' +
        '(select gr_title, round(avg(rate),1) as avgRate from game_rate group by gr_title) as rateAVG ' +
        'on exceptAVG.game_title = rateAVG.gr_title';
    var result;
    connection.query(sql,  function (err, rows) {
        var k;
        var l;
        var avg;
        var sum = 0;
        var k_deviation = 0;
        var l_deviation = 0;
        for(var i = 0; i < rows.length; i++){
            k = rows[i].k_rate;
            l = rows[i].l_rate;
            avg = rows[i].avgRate;
            sum += (k - avg) * (l - avg);
            k_deviation += (k - avg)^2;
            l_deviation += (l - avg)^2;
        }
       //return (sum / (Math.sqrt(k_deviation) * Math.sqrt(l_deviation)));
         return  (sum / (Math.sqrt(k_deviation) * Math.sqrt(l_deviation)));
    });
}

app.listen(app.get('port'), function () {
    console.log("connection 3000 port");
});