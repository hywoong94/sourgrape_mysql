/**
 * Created by hyw on 2016-11-08.
 */
var express = require("express");
var bodyParser = require("body-parser");
var mysql = require('mysql');
var moment = require('moment');
//multer : file upload
var connection = mysql.createConnection({
    // host: 'localhost',
    host: '14.63.227.88',
    user: 'root',
    // password: '1234',
    password: 'P@sswOrd',
    // database: 'testhost'
    database: 'sourgrape'

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
app.set('port', process.env.port || 3000 || 3306);
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

// 게임 목록과 그에 대한 평균을 보내준다. (전체랭킹) // 최근 1년의 데이터 중 30명 이상 평가를 한 게임의 평점 내림차순, 평점의 수 내림차순으로 정렬한 전체 랭킹.
app.get('/game-rate', function (req, res) {
    //var sql = 'SELECT gr_title, gr_id, round(avg(rate),1) as rate, rate_date FROM game_rate group by gr_title order by rate desc;';
    var now = moment(new Date());
    var oneYearAgoDate = now.subtract(100, 'years').format("YYYY-MM-DD");
    var sql = 'select gr_title, "EMPTYDATA", rate, "' + oneYearAgoDate + '" from (select gr_title, count(*) as rateCount, round(avg(rate),1) as rate from game_rate where rate_date > "' + oneYearAgoDate + '" group by gr_title) as ta where ta.rateCount > 0 order by rate  desc, ta.rateCount desc';
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

// 타이틀에 해당하는 게임 평균을 보내준다.
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

// 유사도 점수를 target과 compare에 해당하는 레코드를 보내준다.
// app.get('/similar/:target/:compare', function (req, res) {
//     var sql = 'select * from sim_score where k_id = "' + req.params.target + '" AND l_id = "' + req.params.compare + '"';
//     connection.query(sql, function (err, rows, fields) {
//         res.json(rows);
//     });
// });

// 해당 게임에 대한 5~1 까지 평점 갯수를 보내준다.
app.get('/game-rates/game/:title', function (req, res) {
    var sql = 'select rate, count(*) as count from game_rate where gr_title = "' + req.params.title + '" group by rate order by rate desc';
    connection.query(sql, function (err, rows, fields) {
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

// 로그인한 유저가 평가한 게임에 하나라도 평점을 남긴 애들의 목록을 보내준다.
// app.get('/user/compare/:id', function (req, res) {
//     var sql = 'select DISTINCT gr_id from game_rate where gr_title in (select gr_title from game_rate where gr_id = "' + req.params.id + '") AND gr_id != "' + req.params.id + '"';
//     connection.query(sql, function (err, rows, fields) {
//         res.json(rows);
//     });
// });

// similar 점수를 위한 target, compare 를 입력 받고 그에 해당하는 점수와 평균을 보내준다.
// app.get('/game-rate/similar/:target/:compare', function (req, res) {
//     var sql = 'select l, k_rate, l_rate, avgRate ' +
//         'from (SELECT KT.gr_title as game_title , KT.gr_id as k, KT.rate as k_rate, LT.gr_id as l, LT.rate as l_rate FROM (select * from game_rate where gr_id = "' + req.params.target + '") as KT , ' +
//         '(select * from game_rate where gr_id = "' + req.params.compare + '") as LT where KT.gr_title in (LT.gr_title)) as exceptAVG ' +
//         'join (select gr_title, round(avg(rate),1) as avgRate from game_rate group by gr_title) as rateAVG on exceptAVG.game_title = rateAVG.gr_title';
//     connection.query(sql, function (err, rows, fields) {
//         res.json(rows);
//     });
// });

// similar 점수를 위한 target, compare 를 입력 받고 둘다 평가한 게임의 목록을 출력한다.
// app.get('/games/:target/:compare', function (req, res) {
//     var sql = 'select * from game where title in (select a.gr_title from (select * from game_rate where gr_id = "' + req.params.target + '") as a ' +
//         'join (select * from game_rate where gr_id = "' + req.params.compare + '") as b on a.gr_title = b.gr_title)';
//     connection.query(sql, function (err, rows, fields) {
//         res.json(rows);
//     });
// });

// sim score에 필요한 L user list 를 반환한다.
app.get('/users/:id/:num', function (req, res) {
    var sql = 'select gr_id as id, count(*) as compareC from game_rate where gr_title in (select gr_title from game_rate where gr_id = "' + req.params.id + '") AND gr_id != "' + req.params.id + '" group by gr_id order by compareC desc limit ' + req.params.num;
    connection.query(sql, function (err, rows, fields) {
        res.json(rows);
    });
});

// sim score 계산
app.get('/calcul_simScore/:K/:L', function (req, res) {
    var sql = 'select k_rate, l_rate, avgRate ' +
        'from (SELECT KT.gr_title as game_title , KT.gr_id as k, KT.rate as k_rate, LT.gr_id as l, LT.rate as l_rate FROM (select * from game_rate where gr_id = "' + req.params.K + '") as KT , ' +
        '(select * from game_rate where gr_id = "' + req.params.L + '") as LT  where KT.gr_title in (LT.gr_title)) as exceptAVG ' +
        'join ' +
        '(select gr_title, round(avg(rate),1) as avgRate from game_rate group by gr_title) as rateAVG ' +
        'on exceptAVG.game_title = rateAVG.gr_title limit 20';
    connection.query(sql, function (err, rows, fields) {
        var k;
        var l;
        var avg;
        var sum = 0;
        var k_deviation = 0;
        var l_deviation = 0;
        for (var i = 0; i < rows.length; i++) {
            k = rows[i].k_rate;
            l = rows[i].l_rate;
            avg = rows[i].avgRate;
            sum += (k - avg) * (l - avg);
            k_deviation += (k - avg) * (k - avg);
            l_deviation += (l - avg) * (l - avg);
        }
        var sim_score = sum / (Math.sqrt(k_deviation) * Math.sqrt(l_deviation));
        res.json(sim_score);
        // //sql = 'insert into sim_score values("' + req.params.K + '","' + req.params.L + '",' + result + ')';
        // connection.query(sql,function(err,rows,fields){
        //     res.json();
        // });
    });
});

////////////////////////// post ///////////////////////////
// 유저의 정보를 입력한다.
app.post('/users/insert', function (req, res) {
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

// 로그인한 사용자의 게임 평가 입력.
app.post('/game-rate/insert', function (req, res) {
    var game_rate = {
        "id": req.body.gr_id,
        "title": req.body.gr_title,
        "rate": req.body.rate,
        "date": req.body.rate_date
    };
    var sql = 'insert into game_rate values ("' + req.body.gr_id + '","' + req.body.gr_title + '",' + req.body.rate + ', "' + req.body.rate_date + '")';
    connection.query(sql, function (err, fields) {
        if (!err) {
            res.json(game_rate);
        } else
            console.log("error");
    });
});

app.listen(app.get('port'), function () {
    console.log("connection 3000 port");
});