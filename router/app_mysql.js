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
    database: 'testhost'
    // database: 'sourgrape'

    // host: 'localhost',
    // user: 'root',
    // password: 'hywoong94!',
    // database: 'sourgrape'
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
        console.log(err.toString());
    }
    else {
        console.log("DataBase is Connected !!!\n");
    }
});

// 모든 게임 목록을 보내준다.
app.get('/games', function (req, res) {
    var sql = 'select * from game';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// 게임 목록과 그에 대한 평균을 보내준다. (전체랭킹)
app.get('/game-rate', function (req, res) {
    var sql = 'SELECT gr_title, gr_id, round(avg(rate),1) as rate, rate_date FROM game_rate group by gr_title order by rate desc;';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// 타이틀에 해당하는 게임 정보를 보내준다.
app.get('/game/:title', function (req, res) {
    var sql = 'select * from game where title = "' + req.params.title + '"';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// 타이틀에 해당하는 게임 평가 정보와 평균을 보내준다.
app.get('/game-rate/:title', function (req, res) {
    var sql = 'select gr_title, gr_id, round(avg(rate),1) as rate, rate_date from game_rate where gr_title = "' + req.params.title + '"';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// 키워드로 시작하는 게임정보를 보내준다.
app.get('/search/:keyword', function (req, res) {
    var sql = 'select * from game where title like "%' + req.params.keyword + '%"';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// 타이틀과 아이디에 해당하는 게임 평가 점수를 보내준다.
app.get('/game-rate/:title/:id', function (req, res) {
    var sql = 'select * from game_rate where gr_title = "' + req.params.title + '" AND gr_id = "' + req.params.id + '"';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// 해당하는 아이디가 매긴 모든 게임 평가를 보내준다.
app.get('/game-rates/:id', function (req, res) {
    var sql = 'select * from game_rate where gr_id = "' + req.params.id + '"';
    connection.query(sql, function (err, rows, fields) {
        //res.send(rows);
        res.json(rows);
    });
});

// 아이디에 해당하는 유저의 정보를 보내준다.
app.get('/user/:id', function (req, res) {
    var sql = 'select * from user where id = "' + req.params.id + '"';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// 아이디에 해당하는 유저와 유사도가 비슷한 유저들을 num만큼 보내준다.
app.get('/users/:id/:num', function (req, res) {
    var sql = 'select a.* from ' +
        '(select * from user ) as a ' +
        'join ' +
        '(SELECT * FROM sim_score where k_id = "' + req.params.id + '" order by simScore desc limit ' + req.params.num + ') as b ' +
        'on a.id in (b.l_id);';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// 테에에에스트 ㅋ
// app.get('/users/:id/:num', function (req, res) {
//     var sql = 'select * from user where id != "' + req.params.id + '" limit ' + req.params.num;
//     connection.query(sql, function (err, rows, fields) {
//         res.json(rows);
//     });
// });

// 유사도 점수를 target과 compare에 해당하는 레코드를 보내준다.
app.get('/similar/:target/:compare', function (req, res) {
    var sql = 'select * from sim_score where k_id = "' + req.params.target + '" AND l_id = "' + req.params.compare + '"';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// 해당 게임에 대한 5~1 까지 평점 갯수를 보내준다.
app.get('/game-rates/game/:title', function (req, res) {
    var sql = 'select rate, count(*) as count from game_rate where gr_title = "' + req.params.title + '" group by rate order by rate desc';
    console.log("test : " + sql);
    connection.query(sql, function (err, rows, fields) {
        console.log(sql);
        res.json(rows);
    });
});

// 해당 게임에 대한 원하는 평점의 갯수를 보내준다.
app.get('/game-rates/game/:title/:rate', function (req, res) {
    var sql = 'select count(*) as count from game_rate where gr_title = "' + req.params.title + '" AND rate = ' + req.params.rate + ';';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// 해당 유저가 내린 5~1 까지 평점 갯수를 보내준다.
app.get('/game-rates/user/:id', function (req, res) {
    var sql = 'select rate, count(*) as count from game_rate where gr_id = "' + req.params.id + '" group by rate order by rate desc';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// 해당 유저가 내린 원하는 평점의 갯수를 보내준다.
app.get('/game-rates/user/:id/:rate', function (req, res) {
    var sql = 'select count(*) as count from game_rate where gr_id = "' + req.params.id + '" AND rate = ' + req.params.rate + ';';
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});


////////////////////////// post ///////////////////////////
// 유저의 정보를 입력한다.
app.post('/users', function (req, res) {
    var user = {
        "id": req.body.id,
        "password": req.body.password,
        "name": req.body.name
    };
    var sql = 'insert into user values ("' + req.body.id + '", "' + req.body.password + '", "' + req.body.name + '")';
    connection.query(sql, user, function (err, result) {
        if (err) {
            console.error(err);
            connection.rollback(function () {
                console.error('rollback error');
                throw err;
            });
        }// if err
    });
});

// 진행중...
app.post('/game-rate/insert', function (req, res) {
    var game_rate = {
        "id": req.body.id,
        "title": req.body.title,
        "rate": req.body.rate,
        "date" : req.body.date
    };
    var sql = 'insert into game_rate values ("' + req.body.title + '","' + req.body.id + '",' + req.body.rate +', "' + req.body.date +'")';
    connection.query(sql, function (err, fields) {
        if(!err){
            res.json(game_rate);
        }
        console.log("");
    });
    // res.json(game_rate);
}); // 일단 나중에....

app.listen(app.get('port'), function () {
    console.log("connection 3000 port");
});